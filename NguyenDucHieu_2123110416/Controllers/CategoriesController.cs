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
    [Authorize] // Khóa toàn bộ: Phải có Token mới được vào
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        // Khách hàng xem danh mục: Không cần Token, không xem cái đã xóa
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories
                .Where(c => c.IsDeleted == false)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.IsDeleted == false);

            if (category == null) return NotFound("Danh mục không tồn tại!");
            return category;
        }

        [HttpPost]
        public async Task<ActionResult<Category>> PostCategory(Category category)
        {
            // Móc ID Admin từ Token
            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            category.CreatedBy = adminId;
            category.CreatedAt = DateTime.Now;

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetCategory", new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, Category category)
        {
            if (id != category.Id) return BadRequest("ID không khớp!");

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            category.UpdatedBy = adminId;
            category.UpdatedAt = DateTime.Now;

            _context.Entry(category).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // XÓA MỀM 1 DÒNG
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null || category.IsDeleted) return NotFound();

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            category.IsDeleted = true;
            category.DeletedAt = DateTime.Now;
            category.DeletedBy = adminId;
            category.IsActive = false;

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa danh mục '{category.CategoryName}' thành công!" });
        }

        // XÓA MỀM NHIỀU DÒNG
        [HttpDelete("multiple")]
        public async Task<IActionResult> DeleteMultipleCategories([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids)) return BadRequest("Vui lòng nhập danh sách ID!");

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var idList = ids.Split(',').Select(i => i.Trim()).Where(i => int.TryParse(i, out _)).Select(int.Parse).ToList();

            var categoriesToDelete = await _context.Categories
                .Where(c => idList.Contains(c.Id) && c.IsDeleted == false)
                .ToListAsync();

            if (!categoriesToDelete.Any()) return NotFound("Không tìm thấy danh mục nào!");

            foreach (var item in categoriesToDelete)
            {
                item.IsDeleted = true;
                item.DeletedAt = DateTime.Now;
                item.DeletedBy = adminId;
                item.IsActive = false;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa thành công {categoriesToDelete.Count} danh mục!" });
        }
    }
}