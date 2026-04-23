using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ContactsController(AppDbContext context) => _context = context;

        [HttpPost]
        public async Task<IActionResult> SendContact(Contact contact)
        {
            contact.CreatedAt = DateTime.Now;
            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Gửi lời nhắn thành công!" });
        }

        [HttpGet]
        [Authorize(Roles = "Admin")] // CHỈ ADMIN MỚI ĐƯỢC XEM TẤT CẢ
        public async Task<ActionResult<IEnumerable<Contact>>> GetContacts()
        {
            return await _context.Contacts.OrderByDescending(c => c.CreatedAt).ToListAsync();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // CHỈ ADMIN MỚI ĐƯỢC XÓA
        public async Task<IActionResult> Delete(int id)
        {
            var c = await _context.Contacts.FindAsync(id);
            if (c == null) return NotFound();
            _context.Contacts.Remove(c);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("my-contacts")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Contact>>> GetMyContacts()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email)) return Unauthorized();

            var myHistory = await _context.Contacts
                                          .Where(c => c.Email == email)
                                          .OrderByDescending(c => c.CreatedAt)
                                          .ToListAsync();
            return Ok(myHistory);
        }
        // ====================================================
        // 💡 API TRẢ LỜI LIÊN HỆ CỦA KHÁCH HÀNG
        // ====================================================
        [HttpPost("{id}/reply")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReplyContact(int id, [FromBody] ReplyContactDto request)
        {
            var contact = await _context.Contacts.FindAsync(id);
            if (contact == null)
            {
                return NotFound(new { error = "Không tìm thấy thư liên hệ này!" });
            }

            if (string.IsNullOrEmpty(request.ReplyMessage))
            {
                return BadRequest(new { error = "Sếp chưa nhập nội dung trả lời kìa!" });
            }

            contact.ReplyMessage = request.ReplyMessage;
            contact.IsReplied = true;
            contact.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã gửi câu trả lời cho khách thành công! ✨" });
        }
    }

    // 💡 DTO ĐỂ HỨNG DỮ LIỆU TRẢ LỜI TỪ FRONTEND (Nhớ để ngoài class ContactsController nha)
    public class ReplyContactDto
    {
        public string ReplyMessage { get; set; } = string.Empty;
    }
}
