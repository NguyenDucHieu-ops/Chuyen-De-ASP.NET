using System.Security.Claims;
using System.ComponentModel.DataAnnotations; // MỚI THÊM: Để dùng bộ lọc Validation
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
        // PHẦN 1: CÁC API DÀNH CHO ADMIN QUẢN LÝ (Đã bọc thép)
        // ====================================================

        [HttpGet]
        [Authorize(Roles = "Admin")] // KHIÊN CHẮN: Chỉ Admin mới được lấy danh sách
        public async Task<ActionResult<IEnumerable<User>>> GetUsers() =>
            await _context.Users.Include(u => u.Role).ToListAsync();

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();
            return user;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetUser", new { id = user.Id }, user);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutUser(int id, User user)
        {
            if (id != user.Id) return BadRequest("ID không khớp");
            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // QUAN TRỌNG: Ngăn chặn hack xóa user
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
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
        [Authorize] // Bắt buộc đăng nhập mới cho xem thông tin cá nhân
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
                address = ""
            });
        }

        // DTO đã được nâng cấp với Validation
        public class ProfileUpdateDto
        {
            [Required(ErrorMessage = "Không được để trống họ tên!")]
            [MaxLength(50, ErrorMessage = "Tên quá dài!")]
            public string FullName { get; set; }

            [Required(ErrorMessage = "Không được để trống số điện thoại!")]
            [RegularExpression(@"^(0[3|5|7|8|9])+([0-9]{8})$", ErrorMessage = "Phải là số điện thoại VN hợp lệ (10 số)!")]
            public string Phone { get; set; }

            public string Address { get; set; }
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateMyProfile([FromBody] ProfileUpdateDto request)
        {
            // Kiểm tra xem dữ liệu gửi lên có vi phạm Ràng buộc (Validation) ở trên không
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null) return NotFound("Không tìm thấy user");

            user.FullName = request.FullName;
            user.PhoneNumber = request.Phone;

            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật thành công!" });
        }
    }
}