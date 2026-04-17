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

        // 1. Lấy toàn bộ danh sách (Khách & Admin)
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Topping>>> GetToppings() =>
            await _context.Toppings.Where(t => t.IsDeleted == false).ToListAsync();

        // 2. Lấy chi tiết 1 Topping (Cần thiết để hàm Post không bị lỗi 500)
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Topping>> GetTopping(int id)
        {
            var topping = await _context.Toppings.FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);
            if (topping == null) return NotFound();
            return topping;
        }

        // 3. Thêm mới Topping (Admin)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Topping>> PostTopping(Topping topping)
        {
            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            topping.CreatedBy = adminId;
            topping.CreatedAt = DateTime.Now;
            topping.IsDeleted = false; // Đảm bảo không bị ẩn khi vừa tạo

            _context.Toppings.Add(topping);
            await _context.SaveChangesAsync();

            // nameof(GetTopping) sẽ tự lấy tên hàm số 2 ở trên, cực chuẩn
            return CreatedAtAction(nameof(GetTopping), new { id = topping.Id }, topping);
        }

        // 4. Cập nhật Topping (Admin - Để cái nút Sửa bên React nó chạy)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutTopping(int id, Topping topping)
        {
            if (id != topping.Id) return BadRequest("ID không khớp");

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            topping.UpdatedBy = adminId;
            topping.UpdatedAt = DateTime.Now;

            _context.Entry(topping).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Toppings.Any(e => e.Id == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // 5. Xóa Topping (Xóa mềm)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTopping(int id)
        {
            var topping = await _context.Toppings.FindAsync(id);
            if (topping == null) return NotFound();

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            topping.IsDeleted = true;
            topping.IsActive = false;
            topping.DeletedBy = adminId;
            topping.DeletedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa topping thành công!" });
        }
    }
}