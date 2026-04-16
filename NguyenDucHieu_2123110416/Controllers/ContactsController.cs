using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // QUAN TRỌNG: Phải có dòng này để hết lỗi ToListAsync
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

        [HttpPost] // Khách gửi tin
        public async Task<IActionResult> SendContact(Contact contact)
        {
            contact.CreatedAt = DateTime.Now;
            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Gửi lời nhắn thành công!" });
        }

        [HttpGet] // Admin xem danh sách
        [Authorize]
        public async Task<ActionResult<IEnumerable<Contact>>> GetContacts()
        {
            return await _context.Contacts.OrderByDescending(c => c.CreatedAt).ToListAsync();
        }

        [HttpDelete("{id}")] // Admin xóa
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var c = await _context.Contacts.FindAsync(id);
            if (c == null) return NotFound();
            _context.Contacts.Remove(c);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
} // Chỉ 1 dấu đóng ngoặc ở đây thôi Hiếu nhé!