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
    public class VouchersController : ControllerBase
    {
        private readonly AppDbContext _context;
        public VouchersController(AppDbContext context) { _context = context; }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Voucher>>> GetVouchers()
        {
            var now = DateTime.Now;
            return await _context.Vouchers
                .Where(v => v.IsDeleted == false && v.IsActive == true && v.ExpiryDate >= now)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Voucher>> GetVoucher(int id)
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Id == id && v.IsDeleted == false);
            if (voucher == null) return NotFound("Voucher không tồn tại!");
            return voucher;
        }

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

            return CreatedAtAction(nameof(GetVoucher), new { id = voucher.Id }, voucher);
        }

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

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteVoucher(int id)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null || voucher.IsDeleted) return NotFound();

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            voucher.IsDeleted = true;
            voucher.IsActive = false;
            voucher.DeletedBy = adminId;
            voucher.DeletedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa voucher '{voucher.Code}'!" });
        }
        // ====================================================
        // 💡 API CHO KHÁCH HÀNG: ĐỔI ĐIỂM LẤY VOUCHER
        // ====================================================
        [HttpPost("redeem/{id}")]
        [Authorize]
        public async Task<IActionResult> RedeemVoucher(int id)
        {
            try
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
                int userId = int.Parse(userIdString);

                // 1. Tìm Voucher
                var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Id == id && v.IsDeleted == false && v.IsActive == true);
                if (voucher == null || voucher.ExpiryDate < DateTime.Now)
                    return BadRequest(new { error = "Voucher không tồn tại hoặc đã hết hạn!" });

                // Nếu Voucher 0 điểm thì không cần đổi
                if (voucher.PointsRequired <= 0)
                    return Ok(new { message = "Voucher này miễn phí, hãy copy mã dùng ngay!", code = voucher.Code });

                // 2. Tính tổng điểm hiện tại của khách
                var currentPoints = await _context.PointTransactions
                    .Where(t => t.UserId == userId)
                    .SumAsync(t => (int?)t.Points) ?? 0;

                // 3. Kiểm tra xem có đủ điểm không
                if (currentPoints < voucher.PointsRequired)
                    return BadRequest(new { error = $"Sếp cần {voucher.PointsRequired} điểm để đổi mã này (Hiện có: {currentPoints}). Trà sữa thêm đi sếp!" });

                // 4. Trừ điểm (Tạo một giao dịch điểm mang số ÂM)
                var pointTransaction = new PointTransaction
                {
                    UserId = userId,
                    Points = -voucher.PointsRequired, // 💡 Trừ điểm
                    Description = $"Đổi {voucher.PointsRequired} điểm lấy Voucher: {voucher.Code}",
                    CreatedAt = DateTime.Now,
                    CreatedBy = userId
                };

                _context.PointTransactions.Add(pointTransaction);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đổi điểm thành công! Mã đã được copy.", code = voucher.Code });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }
    }
}