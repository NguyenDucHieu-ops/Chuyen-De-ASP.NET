using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ToppingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ToppingsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Topping>>> GetToppings() => await _context.Toppings.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Topping>> GetTopping(int id)
        {
            var topping = await _context.Toppings.FindAsync(id);
            if (topping == null) return NotFound();
            return topping;
        }

        [HttpPost]
        public async Task<ActionResult<Topping>> PostTopping(Topping topping)
        {
            _context.Toppings.Add(topping);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetTopping", new { id = topping.Id }, topping);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTopping(int id, Topping topping)
        {
            if (id != topping.Id) return BadRequest("ID không khớp");
            _context.Entry(topping).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTopping(int id)
        {
            var topping = await _context.Toppings.FindAsync(id);
            if (topping == null) return NotFound();
            _context.Toppings.Remove(topping);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("multiple")]
        public async Task<IActionResult> DeleteMultipleToppings([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids)) return BadRequest("Vui lòng nhập danh sách ID!");
            var idList = ids.Split(',').Select(i => i.Trim()).Where(i => int.TryParse(i, out _)).Select(int.Parse).ToList();
            var toppingsToDelete = await _context.Toppings.Where(t => idList.Contains(t.Id)).ToListAsync();
            if (!toppingsToDelete.Any()) return NotFound("Không tìm thấy topping nào để xóa!");

            _context.Toppings.RemoveRange(toppingsToDelete);
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa thành công {toppingsToDelete.Count} topping!" });
        }
    }
}