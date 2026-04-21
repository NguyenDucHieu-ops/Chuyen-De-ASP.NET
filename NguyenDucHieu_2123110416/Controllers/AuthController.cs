using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NguyenDucHieu_2123110416.DTOs;
using NguyenDucHieu_2123110416.Services;
using System.Security.Claims;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO request)
        {
            try { return Ok(new { message = await _authService.RegisterAsync(request) }); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO request)
        {
            try { return Ok(new { message = "Đăng nhập thành công!", token = await _authService.LoginAsync(request) }); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO request)
        {
            try { return Ok(new { message = await _authService.ForgotPasswordAsync(request.Email) }); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO request)
        {
            try { return Ok(new { message = await _authService.ResetPasswordAsync(request.Email, request.Token, request.NewPassword) }); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [Authorize] // Bắt buộc phải có Token (đã đăng nhập) mới được đổi mật khẩu
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO request)
        {
            try
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

                int userId = int.Parse(userIdString);
                return Ok(new { message = await _authService.ChangePasswordAsync(userId, request.OldPassword, request.NewPassword) });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }
    }

    // Các DTO khai báo chung ở đây hoặc trong folder DTOs tùy sếp
    public class ForgotPasswordDTO { public string Email { get; set; } = null!; }
    public class ResetPasswordDTO
    {
        public string Email { get; set; } = null!;
        public string Token { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }
    public class ChangePasswordDTO
    {
        public string OldPassword { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }
}