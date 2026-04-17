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
    public class PointTransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PointTransactionsController(AppDbContext context)
        {
            _context = context;
        }

        // 💡 GIỮ LẠI MỘT HÀM GET DUY NHẤT NÀY THÔI
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTransactions()
        {
            var list = await _context.PointTransactions
                .Include(t => t.User)
                .Include(t => t.Order)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new {
                    t.Id,
                    t.Points,
                    t.Description,
                    t.CreatedAt,
                    CustomerName = t.User != null ? t.User.FullName : "Khách ẩn danh",
                    OrderTotal = t.Order != null ? t.Order.FinalAmount : 0,
                    OrderCode = t.Order != null ? t.Order.Id.ToString() : "N/A"
                })
                .ToListAsync();

            return Ok(list);
        }

        // 🚨 Nếu sếp thấy còn hàm nào tên là GetPointTransactions thì XÓA NÓ ĐI nhé!
    }
}