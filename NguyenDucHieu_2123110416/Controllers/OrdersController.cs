using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders() => await _context.Orders.Include(o => o.User).ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders.Include(o => o.User).Include(o => o.OrderDetails).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();
            return order;
        }

        [HttpPost]
        public async Task<ActionResult<Order>> PostOrder(Order order)
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetOrder", new { id = order.Id }, order);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(int id, Order order)
        {
            if (id != order.Id) return BadRequest("ID không khớp!");
            _context.Entry(order).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("multiple")]
        public async Task<IActionResult> DeleteMultipleOrders([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids)) return BadRequest("Vui lòng nhập danh sách ID!");
            var idList = ids.Split(',').Select(i => i.Trim()).Where(i => int.TryParse(i, out _)).Select(int.Parse).ToList();
            var listToDelete = await _context.Orders.Where(x => idList.Contains(x.Id)).ToListAsync();
            if (!listToDelete.Any()) return NotFound("Không tìm thấy dữ liệu để xóa!");

            _context.Orders.RemoveRange(listToDelete);
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa thành công {listToDelete.Count} hóa đơn!" });
        }
    }
}