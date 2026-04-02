using Microsoft.AspNetCore.Authorization; // Thêm bảo mật
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;
using System.Security.Claims; // Thêm để đọc Token

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Khóa hết: Phải đăng nhập Admin mới được can thiệp
    public class ToppingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ToppingsController(AppDbContext context)
        {
            _context = context;
        }

        // Khách xem danh sách topping để chọn món: Không cần Token, không xem hàng đã xóa
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Topping>>> GetToppings()
        {
            return await _context.Toppings
                .Where(t => t.IsDeleted == false)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Topping>> GetTopping(int id)
        {
            var topping = await _context.Toppings
                .FirstOrDefaultAsync(t => t.Id == id && t.IsDeleted == false);

            if (topping == null) return NotFound("Topping không tồn tại!");
            return topping;
        }

        [HttpPost]
        public async Task<ActionResult<Topping>> PostTopping(Topping topping)
        {
            // Tự động lấy ID người tạo từ Token
            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            topping.CreatedBy = adminId;
            topping.CreatedAt = DateTime.Now;

            _context.Toppings.Add(topping);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetTopping", new { id = topping.Id }, topping);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTopping(int id, Topping topping)
        {
            if (id != topping.Id) return BadRequest("ID không khớp");

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            topping.UpdatedBy = adminId;
            topping.UpdatedAt = DateTime.Now;

            _context.Entry(topping).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // XÓA MỀM 1 DÒNG
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTopping(int id)
        {
            var topping = await _context.Toppings.FindAsync(id);
            if (topping == null || topping.IsDeleted) return NotFound();

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Chuyển sang trạng thái xóa mềm
            topping.IsDeleted = true;
            topping.DeletedAt = DateTime.Now;
            topping.DeletedBy = adminId;
            topping.IsActive = false;

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa topping '{topping.ToppingName}' thành công!" });
        }

        // XÓA MỀM NHIỀU DÒNG
        [HttpDelete("multiple")]
        public async Task<IActionResult> DeleteMultipleToppings([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids)) return BadRequest("Vui lòng nhập danh sách ID!");

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var idList = ids.Split(',').Select(i => i.Trim()).Where(i => int.TryParse(i, out _)).Select(int.Parse).ToList();

            var toppingsToDelete = await _context.Toppings
                .Where(t => idList.Contains(t.Id) && t.IsDeleted == false)
                .ToListAsync();

            if (!toppingsToDelete.Any()) return NotFound("Không tìm thấy topping nào hợp lệ!");

            foreach (var item in toppingsToDelete)
            {
                item.IsDeleted = true;
                item.DeletedAt = DateTime.Now;
                item.DeletedBy = adminId;
                item.IsActive = false;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa mềm thành công {toppingsToDelete.Count} topping!" });
        }
    }
}