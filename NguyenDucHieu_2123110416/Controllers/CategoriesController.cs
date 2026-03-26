using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();
            return category;
        }

        [HttpPost]
        public async Task<ActionResult<Category>> PostCategory(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetCategory", new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, Category category)
        {
            if (id != category.Id) return BadRequest("ID không khớp!");

            _context.Entry(category).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // XÓA 1 DÒNG (MẶC ĐỊNH)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // XÓA NHIỀU DÒNG CÙNG LÚC (API MỚI)
        // Cách dùng trên Swagger: Gõ "1,2,3" vào ô ids
        [HttpDelete("multiple")]
        public async Task<IActionResult> DeleteMultipleCategories([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids)) return BadRequest("Vui lòng nhập danh sách ID!");

            // Cắt chuỗi "1,2,3" thành mảng số nguyên, tự động bỏ qua khoảng trắng hoặc chữ bậy bạ
            var idList = ids.Split(',')
                            .Select(i => i.Trim())
                            .Where(i => int.TryParse(i, out _))
                            .Select(int.Parse)
                            .ToList();

            var categoriesToDelete = await _context.Categories
                                                   .Where(c => idList.Contains(c.Id))
                                                   .ToListAsync();

            if (!categoriesToDelete.Any()) return NotFound("Không tìm thấy danh mục nào để xóa!");

            _context.Categories.RemoveRange(categoriesToDelete);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã xóa thành công {categoriesToDelete.Count} danh mục!" });
        }
    }
}