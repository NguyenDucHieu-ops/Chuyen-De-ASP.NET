using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Bảo mật tuyệt đối: Chỉ Admin mới được xem Camera
    public class ActivityLogsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ActivityLogsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetSystemLogs()
        {
            // Kết hợp bảng Log và bảng User để lấy Tên người thực hiện
            var logs = await _context.ActivityLogs
                .Join(_context.Users,
                    log => log.UserId,
                    user => user.Id,
                    (log, user) => new
                    {
                        log.Id,
                        AdminName = user.FullName,
                        log.ActionType,
                        log.EntityName,
                        log.EntityId,
                        log.Timestamp,
                        log.OldValues,
                        log.NewValues
                    })
                .OrderByDescending(l => l.Timestamp)
                .Take(100) // Lấy 100 hành động mới nhất cho web chạy mượt
                .ToListAsync();

            return Ok(logs);
        }
    }
}