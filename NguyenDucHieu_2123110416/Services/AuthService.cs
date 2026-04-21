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
        private readonly IEmailService _emailService; // Tích hợp Email Service vào đây

        public AuthService(AppDbContext context, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

        public async Task<string> RegisterAsync(RegisterDTO request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                throw new Exception("Email này đã được sử dụng!");

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Customer");
            if (role == null) throw new Exception("Hệ thống chưa có Role Customer!");

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = hashedPassword,
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
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !user.IsActive)
                throw new Exception("Tài khoản không tồn tại hoặc đã bị khóa!");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new Exception("Sai mật khẩu!");

            return GenerateJwtToken(user);
        }

        // =================================================================
        // 🚀 TÍNH NĂNG MỚI: QUÊN MẬT KHẨU
        // =================================================================
        public async Task<string> ForgotPasswordAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) throw new Exception("Không tìm thấy tài khoản với Email này!");

            // Tạo một đoạn mã ngẫu nhiên dài dài làm Token
            string resetToken = Guid.NewGuid().ToString("N");

            // Lưu Token vào DB và cho thời hạn 15 phút
            user.ResetPasswordToken = resetToken;
            user.ResetPasswordExpiry = DateTime.Now.AddMinutes(15);
            await _context.SaveChangesAsync();

            // Link này sẽ trỏ về Frontend (React) của sếp
            string resetLink = $"https://chuyen-de-asp-net.vercel.app/reset-password?email={email}&token={resetToken}";

            string emailBody = $@"
                <h3>Yêu cầu lấy lại mật khẩu HieuStore</h3>
                <p>Chào {user.FullName},</p>
                <p>Ai đó vừa yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nếu là bạn, hãy click vào nút bên dưới (Link có hiệu lực trong 15 phút):</p>
                <a href='{resetLink}' style='display:inline-block; padding:10px 20px; background-color:#4F46E5; color:#fff; text-decoration:none; border-radius:5px;'>ĐẶT LẠI MẬT KHẨU</a>
                <p>Nếu không phải bạn, vui lòng bỏ qua email này.</p>";

            await _emailService.SendEmailAsync(user.Email, "🔐 Đặt lại mật khẩu HieuStore", emailBody);

            return "Vui lòng kiểm tra hộp thư Email để đặt lại mật khẩu!";
        }

        // =================================================================
        // 🚀 TÍNH NĂNG MỚI: ĐẶT LẠI MẬT KHẨU TỪ LINK EMAIL
        // =================================================================
        public async Task<string> ResetPasswordAsync(string email, string token, string newPassword)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) throw new Exception("Tài khoản không tồn tại!");

            // Kiểm tra mã Token có đúng không và có bị hết hạn không
            if (user.ResetPasswordToken != token || user.ResetPasswordExpiry < DateTime.Now)
                throw new Exception("Link khôi phục mật khẩu không hợp lệ hoặc đã hết hạn!");

            // Mã hóa pass mới và cập nhật
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);

            // Dọn dẹp Token cũ cho an toàn
            user.ResetPasswordToken = null;
            user.ResetPasswordExpiry = null;

            await _context.SaveChangesAsync();
            return "Đặt lại mật khẩu thành công! Giờ sếp có thể đăng nhập.";
        }

        // =================================================================
        // 🚀 TÍNH NĂNG MỚI: ĐỔI MẬT KHẨU KHI ĐANG ĐĂNG NHẬP
        // =================================================================
        public async Task<string> ChangePasswordAsync(int userId, string oldPassword, string newPassword)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new Exception("Không tìm thấy tài khoản!");

            // So sánh mật khẩu cũ xem nhập đúng không
            if (!BCrypt.Net.BCrypt.Verify(oldPassword, user.PasswordHash))
                throw new Exception("Mật khẩu hiện tại không chính xác!");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _context.SaveChangesAsync();

            return "Đổi mật khẩu thành công!";
        }

        // HÀM BÍ MẬT: ĐÚC TOKEN
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role != null ? user.Role.Name : "Customer")
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

            return tokenHandler.WriteToken(token);
        }
    }
}