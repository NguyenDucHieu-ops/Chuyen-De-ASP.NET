using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.DTOs;
using NguyenDucHieu_2123110416.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace NguyenDucHieu_2123110416.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<string> RegisterAsync(RegisterDTO request)
        {
            // 1. Kiểm tra Email có bị trùng không
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                throw new Exception("Email này đã được sử dụng!");

            // 2. Mặc định gán quyền Customer (Khách hàng) cho người mới đăng ký
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Customer");
            if (role == null) throw new Exception("Hệ thống chưa có Role Customer!");

            // 3. Nghiệp vụ bắt buộc: Mã hóa mật khẩu bằng BCrypt trước khi lưu
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = hashedPassword, // Lưu cục Hash loằng ngoằng, không lưu pass thật
                PhoneNumber = request.PhoneNumber ?? "",
                RoleId = role.Id,
                IsActive = true,
                LoyaltyPoints = 0
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return "Đăng ký tài khoản thành công!";
        }

        public async Task<string> LoginAsync(LoginDTO request)
        {
            // 1. Tìm user và Include luôn Role để biết người này là Admin hay Customer
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !user.IsActive)
                throw new Exception("Tài khoản không tồn tại hoặc đã bị khóa!");

            // 2. So sánh mật khẩu người dùng gõ vào với cục Hash trong Database
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new Exception("Sai mật khẩu!");

            // 3. Nếu đúng hết, tiến hành rập khuôn đúc Token
            return GenerateJwtToken(user);
        }

        // HÀM BÍ MẬT: ĐÚC TOKEN
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

            // Gói thông tin của User vào bên trong Token (gọi là Claims)
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "Customer") // Rất quan trọng để phân quyền
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(double.Parse(jwtSettings["ExpireDays"]!)),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token); // Trả về chuỗi loằng ngoằng eyJhbG...
        }
    }
}