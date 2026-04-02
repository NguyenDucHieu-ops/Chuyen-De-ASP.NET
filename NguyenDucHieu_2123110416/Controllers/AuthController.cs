using Microsoft.AspNetCore.Mvc;
using NguyenDucHieu_2123110416.DTOs;
using NguyenDucHieu_2123110416.Services;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        // Bơm cái Service bọc thép lúc nãy vào đây
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO request)
        {
            try
            {
                var result = await _authService.RegisterAsync(request);
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                // Nếu trùng email hoặc lỗi gì thì quăng ra đây
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO request)
        {
            try
            {
                var token = await _authService.LoginAsync(request);
                return Ok(new
                {
                    message = "Đăng nhập thành công!",
                    token = token
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}