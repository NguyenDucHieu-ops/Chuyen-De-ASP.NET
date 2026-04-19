using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using System.Security.Claims;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public NotificationsController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(30)
                .ToListAsync();
            return Ok(notifications);
        }

        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllRead()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var unread = await _context.Notifications.Where(n => n.UserId == userId && !n.IsRead).ToListAsync();
            unread.ForEach(n => n.IsRead = true);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}