using System.ComponentModel.DataAnnotations;

namespace NguyenDucHieu_2123110416.DTOs
{
    public class LoginDTO
    {
        [Required(ErrorMessage = "Vui lòng nhập Email!")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng!")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Vui lòng nhập Mật khẩu!")]
        public string Password { get; set; } = null!;
    }

    public class RegisterDTO
    {
        [Required(ErrorMessage = "Vui lòng nhập Họ Tên!")]
        public string FullName { get; set; } = null!;

        [Required, EmailAddress]
        public string Email { get; set; } = null!;

        [Required, MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự trở lên!")]
        public string Password { get; set; } = null!;

        public string? PhoneNumber { get; set; }
    }
}