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
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

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
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Category>> PostCategory([FromBody] CategoryUpdateDTO dto)
        {
            var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(adminIdString)) return Unauthorized();

            var category = new Category
            {
                CategoryName = dto.CategoryName,
                // Đã gỡ thuộc tính Description vì Model Category của sếp không có
                IsActive = dto.IsActive,
                IsDeleted = false,
                CreatedBy = int.Parse(adminIdString),
                CreatedAt = DateTime.Now
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetCategory", new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutCategory(int id, [FromBody] CategoryUpdateDTO dto)
        {
            if (id != dto.Id) return BadRequest("ID không khớp!");

            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound("Không thấy danh mục này!");

            var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(adminIdString)) return Unauthorized();

            // Cập nhật an toàn (Đã gỡ Description)
            category.CategoryName = dto.CategoryName;
            category.IsActive = dto.IsActive;

            category.UpdatedBy = int.Parse(adminIdString);
            category.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công!" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null || category.IsDeleted) return NotFound();

            category.IsDeleted = true;
            category.DeletedAt = DateTime.Now;
            category.DeletedBy = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            category.IsActive = false;

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa danh mục '{category.CategoryName}'!" });
        }
    }

    // DTO đã loại bỏ trường Description cho chuẩn xác
    public class CategoryUpdateDTO
    {
        public int Id { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}