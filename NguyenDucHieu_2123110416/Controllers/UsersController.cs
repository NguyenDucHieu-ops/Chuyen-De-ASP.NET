using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // ====================================================
        // PHẦN 1: CÁC API DÀNH CHO ADMIN QUẢN LÝ
        // ====================================================

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            // Trả về DTO (hoặc select trường) để tránh lỗi vòng lặp JSON
            var users = await _context.Users
                .Include(u => u.Role)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.PhoneNumber,
                    u.RoleId,
                    RoleName = u.Role != null ? u.Role.Name : "Khách",
                    u.IsActive,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound("Người dùng không tồn tại!");

            return new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.PhoneNumber,
                user.RoleId,
                user.IsActive
            };
        }

        // 💡 FIX LỖI 400: DÙNG DTO CHO POST
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PostUser([FromBody] UserCreateDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Kiểm tra email trùng
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new { error = "Email này đã được sử dụng trên hệ thống!" });
            }

            var newUser = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                RoleId = dto.RoleId,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Tạo tài khoản thành công!", id = newUser.Id });
        }

        // 💡 FIX LỖI 400: DÙNG DTO CHO PUT
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutUser(int id, [FromBody] UserUpdateDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (id != dto.Id) return BadRequest(new { error = "ID không khớp!" });

            var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null) return NotFound(new { error = "Không tìm thấy người dùng!" });

            // Cập nhật thông tin (không đổi email và password ở đây để an toàn)
            existingUser.FullName = dto.FullName;
            existingUser.RoleId = dto.RoleId;

            // Nếu admin muốn đổi cả số điện thoại/trạng thái thì thêm vào đây
            // existingUser.PhoneNumber = dto.PhoneNumber;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thông tin thành công!" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            // Ghi log người xóa (Nếu cần)
           

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa tài khoản vĩnh viễn!" });
        }

        [HttpDelete("multiple")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMultipleUsers([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids)) return BadRequest("Vui lòng nhập danh sách ID!");
            var idList = ids.Split(',').Select(i => i.Trim()).Where(i => int.TryParse(i, out _)).Select(int.Parse).ToList();
            var usersToDelete = await _context.Users.Where(u => idList.Contains(u.Id)).ToListAsync();
            if (!usersToDelete.Any()) return NotFound("Không tìm thấy tài khoản nào để xóa!");

            _context.Users.RemoveRange(usersToDelete);
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa thành công {usersToDelete.Count} tài khoản!" });
        }

        // ====================================================
        // PHẦN 2: CÁC API DÀNH CHO KHÁCH HÀNG (TRANG PROFILE)
        // ====================================================

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null) return NotFound("Không tìm thấy user");

            return Ok(new
            {
                fullName = user.FullName,
                email = user.Email,
                phone = user.PhoneNumber,
                address = "" // Chưa có trường Address trong DB User
            });
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateMyProfile([FromBody] ProfileUpdateDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null) return NotFound("Không tìm thấy user");

            user.FullName = request.FullName;
            user.PhoneNumber = request.Phone;
            // user.Address = request.Address;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công!" });
        }

        // ====================================================
        // PHẦN 3: CÁC LỚP DTO CHỐNG LỖI 400
        // ====================================================

        public class UserCreateDTO
        {
            [Required(ErrorMessage = "Vui lòng nhập họ tên!")]
            public string FullName { get; set; } = string.Empty;

            [Required(ErrorMessage = "Vui lòng nhập email!")]
            [EmailAddress(ErrorMessage = "Email không hợp lệ!")]
            public string Email { get; set; } = string.Empty;

            [Required(ErrorMessage = "Vui lòng nhập mật khẩu!")]
            public string Password { get; set; } = string.Empty;

            [Required]
            public int RoleId { get; set; }
        }

        public class UserUpdateDTO
        {
            [Required]
            public int Id { get; set; }

            [Required(ErrorMessage = "Vui lòng nhập họ tên!")]
            public string FullName { get; set; } = string.Empty;

            [Required]
            public int RoleId { get; set; }
        }

        public class ProfileUpdateDto
        {
            [Required(ErrorMessage = "Không được để trống họ tên!")]
            [MaxLength(50, ErrorMessage = "Tên quá dài!")]
            public string FullName { get; set; } = string.Empty;

            [Required(ErrorMessage = "Không được để trống số điện thoại!")]
            [RegularExpression(@"^(0[3|5|7|8|9])+([0-9]{8})$", ErrorMessage = "Phải là số điện thoại VN hợp lệ (10 số)!")]
            public string Phone { get; set; } = string.Empty;

            public string Address { get; set; } = string.Empty;
        }
    }
}