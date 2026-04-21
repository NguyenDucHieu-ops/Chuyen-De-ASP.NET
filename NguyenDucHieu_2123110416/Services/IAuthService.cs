using NguyenDucHieu_2123110416.DTOs;

namespace NguyenDucHieu_2123110416.Services
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(RegisterDTO request);
        Task<string> LoginAsync(LoginDTO request);
        Task<string> ForgotPasswordAsync(string email);
        Task<string> ResetPasswordAsync(string email, string token, string newPassword);
        Task<string> ChangePasswordAsync(int userId, string oldPassword, string newPassword);
    }
}