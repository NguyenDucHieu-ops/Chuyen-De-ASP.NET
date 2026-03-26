using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderDetailToppingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public OrderDetailToppingsController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDetailTopping>>> GetOrderDetailToppings() => await _context.OrderDetailToppings.Include(o => o.Topping).ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDetailTopping>> GetOrderDetailTopping(int id)
        {
            var item = await _context.OrderDetailToppings.FindAsync(id);
            if (item == null) return NotFound();
            return item;
        }

        [HttpPost]
        public async Task<ActionResult<OrderDetailTopping>> PostOrderDetailTopping(OrderDetailTopping item)
        {
            _context.OrderDetailToppings.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetOrderDetailTopping", new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrderDetailTopping(int id, OrderDetailTopping item)
        {
            if (id != item.Id) return BadRequest("ID không khớp!");
            _context.Entry(item).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderDetailTopping(int id)
        {
            var item = await _context.OrderDetailToppings.FindAsync(id);
            if (item == null) return NotFound();
            _context.OrderDetailToppings.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("multiple")]
        public async Task<IActionResult> DeleteMultipleOrderDetailToppings([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids)) return BadRequest("Vui lòng nhập danh sách ID!");
            var idList = ids.Split(',').Select(i => i.Trim()).Where(i => int.TryParse(i, out _)).Select(int.Parse).ToList();
            var listToDelete = await _context.OrderDetailToppings.Where(x => idList.Contains(x.Id)).ToListAsync();
            if (!listToDelete.Any()) return NotFound("Không tìm thấy dữ liệu để xóa!");

            _context.OrderDetailToppings.RemoveRange(listToDelete);
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa thành công {listToDelete.Count} topping của đơn!" });
        }
    }
}