using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Chỉ Admin hoặc Service nội bộ mới được đụng vào bảng này
    public class OrderDetailToppingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public OrderDetailToppingsController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDetailTopping>>> GetOrderDetailToppings() =>
            await _context.OrderDetailToppings.Include(o => o.Topping).ToListAsync();

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderDetailTopping(int id)
        {
            var item = await _context.OrderDetailToppings.FindAsync(id);
            if (item == null) return NotFound();
            _context.OrderDetailToppings.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}