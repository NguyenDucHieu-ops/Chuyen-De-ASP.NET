using System.Net;
using System.Net.Mail;

namespace NguyenDucHieu_2123110416.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlBody);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        public EmailService(IConfiguration config) { _config = config; }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            try
            {
                // Tạm thời tui try-catch ở đây để lỡ sếp chưa cài Appsettings (Mật khẩu Gmail) 
                // thì hệ thống vẫn không bị sập lúc khách đặt hàng.
                var settings = _config.GetSection("EmailSettings");
                if (string.IsNullOrEmpty(settings["Mail"])) return;

                var mail = new MailMessage
                {
                    From = new MailAddress(settings["Mail"], settings["DisplayName"]),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true
                };
                mail.To.Add(toEmail);

                using var smtp = new SmtpClient(settings["Host"], int.Parse(settings["Port"]))
                {
                    Credentials = new NetworkCredential(settings["Mail"], settings["Password"]),
                    EnableSsl = true
                };

                await smtp.SendMailAsync(mail);
            }
            catch (Exception ex) { Console.WriteLine("Lỗi gửi mail: " + ex.Message); }
        }
    }
}