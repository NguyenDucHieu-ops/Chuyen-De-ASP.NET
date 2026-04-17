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
    [Authorize] // Bảo mật mặc định cho toàn bộ class
    public class VouchersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VouchersController(AppDbContext context)
        {
            _context = context;
        }

        // Khách hàng lấy danh sách Voucher còn dùng được (Không cần Token)
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Voucher>>> GetVouchers()
        {
            var now = DateTime.Now;
            return await _context.Vouchers
                .Where(v => v.IsDeleted == false &&
                            v.IsActive == true &&
                            v.ExpiryDate >= now)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Voucher>> GetVoucher(int id)
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Id == id && v.IsDeleted == false);
            if (voucher == null) return NotFound("Voucher không tồn tại hoặc đã bị xóa!");
            return voucher;
        }

        // CHỈ ADMIN MỚI ĐƯỢC THÊM VOUCHER
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Voucher>> PostVoucher(Voucher voucher)
        {
            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            voucher.CreatedBy = adminId;
            voucher.CreatedAt = DateTime.Now;
            voucher.IsDeleted = false;

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetVoucher", new { id = voucher.Id }, voucher);
        }

        // CHỈ ADMIN MỚI ĐƯỢC SỬA VOUCHER
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutVoucher(int id, Voucher voucher)
        {
            if (id != voucher.Id) return BadRequest("ID không khớp");

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            voucher.UpdatedBy = adminId;
            voucher.UpdatedAt = DateTime.Now;

            _context.Entry(voucher).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // CHỈ ADMIN MỚI ĐƯỢC XÓA VOUCHER
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteVoucher(int id)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null || voucher.IsDeleted) return NotFound();

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            voucher.IsDeleted = true;
            voucher.DeletedAt = DateTime.Now;
            voucher.DeletedBy = adminId;
            voucher.IsActive = false;

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa voucher '{voucher.Code}' thành công!" });
        }
    }
}