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

        public OrderDetailToppingsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDetailTopping>>> GetOrderDetailToppings()
        {
            return await _context.OrderDetailToppings
                .Include(odt => odt.Topping)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDetailTopping>> GetOrderDetailTopping(int id)
        {
            var orderDetailTopping = await _context.OrderDetailToppings
                .Include(odt => odt.Topping)
                .FirstOrDefaultAsync(odt => odt.Id == id);

            if (orderDetailTopping == null) return NotFound();
            return orderDetailTopping;
        }

        [HttpPost]
        public async Task<ActionResult<OrderDetailTopping>> PostOrderDetailTopping(OrderDetailTopping orderDetailTopping)
        {
            _context.OrderDetailToppings.Add(orderDetailTopping);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetOrderDetailTopping", new { id = orderDetailTopping.Id }, orderDetailTopping);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrderDetailTopping(int id, OrderDetailTopping orderDetailTopping)
        {
            if (id != orderDetailTopping.Id) return BadRequest();

            _context.Entry(orderDetailTopping).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderDetailToppingExists(id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderDetailTopping(int id)
        {
            var orderDetailTopping = await _context.OrderDetailToppings.FindAsync(id);
            if (orderDetailTopping == null) return NotFound();

            _context.OrderDetailToppings.Remove(orderDetailTopping);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool OrderDetailToppingExists(int id)
        {
            return _context.OrderDetailToppings.Any(e => e.Id == id);
        }
    }
}