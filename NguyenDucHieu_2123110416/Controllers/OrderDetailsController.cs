using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;
using System.Security.Claims;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bắt buộc đăng nhập
    public class OrderDetailsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public OrderDetailsController(AppDbContext context) { _context = context; }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetOrderDetails() =>
            await _context.OrderDetails.Include(od => od.Product).ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDetail>> GetOrderDetail(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var orderDetail = await _context.OrderDetails
                .Include(od => od.Product)
                .Include(od => od.OrderDetailToppings)
                .Include(od => od.Order)
                .FirstOrDefaultAsync(od => od.Id == id);

            if (orderDetail == null) return NotFound();

            // Bảo mật: Chỉ chủ đơn hoặc Admin mới được xem
            if (orderDetail.Order.UserId != userId && userRole != "Admin") return Forbid();

            return orderDetail;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<OrderDetail>> PostOrderDetail(OrderDetail orderDetail)
        {
            _context.OrderDetails.Add(orderDetail);
            await _context.SaveChangesAsync();
            // Đã thêm return để vá lỗi CS0161 cho sếp
            return CreatedAtAction("GetOrderDetail", new { id = orderDetail.Id }, orderDetail);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteOrderDetail(int id)
        {
            var orderDetail = await _context.OrderDetails.FindAsync(id);
            if (orderDetail == null) return NotFound();
            _context.OrderDetails.Remove(orderDetail);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}