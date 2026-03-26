using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.Include(p => p.Category).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return NotFound();
            return product;
        }

        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetProduct", new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id) return BadRequest("ID không khớp!");

            _context.Entry(product).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // XÓA 1 DÒNG
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // XÓA NHIỀU DÒNG CÙNG LÚC
        [HttpDelete("multiple")]
        public async Task<IActionResult> DeleteMultipleProducts([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids)) return BadRequest("Vui lòng nhập danh sách ID!");

            var idList = ids.Split(',')
                            .Select(i => i.Trim())
                            .Where(i => int.TryParse(i, out _))
                            .Select(int.Parse)
                            .ToList();

            var productsToDelete = await _context.Products
                                                 .Where(p => idList.Contains(p.Id))
                                                 .ToListAsync();

            if (!productsToDelete.Any()) return NotFound("Không tìm thấy sản phẩm nào để xóa!");

            _context.Products.RemoveRange(productsToDelete);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã xóa thành công {productsToDelete.Count} sản phẩm!" });
        }
    }
}