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
    [Authorize]
    public class ToppingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ToppingsController(AppDbContext context) { _context = context; }

        [HttpGet]
        [AllowAnonymous] // Khách xem để đặt món
        public async Task<ActionResult<IEnumerable<Topping>>> GetToppings() =>
            await _context.Toppings.Where(t => t.IsDeleted == false).ToListAsync();

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Topping>> PostTopping(Topping topping)
        {
            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            topping.CreatedBy = adminId;
            topping.CreatedAt = DateTime.Now;
            _context.Toppings.Add(topping);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetTopping", new { id = topping.Id }, topping);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTopping(int id)
        {
            var topping = await _context.Toppings.FindAsync(id);
            if (topping == null) return NotFound();
            topping.IsDeleted = true;
            topping.IsActive = false;
            topping.DeletedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa topping!" });
        }
    }
}