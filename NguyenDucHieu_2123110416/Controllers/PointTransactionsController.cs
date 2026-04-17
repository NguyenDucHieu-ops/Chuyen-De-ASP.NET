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
    [Authorize] // Bắt buộc đăng nhập
    public class PointTransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PointTransactionsController(AppDbContext context) { _context = context; }

        // Lấy lịch sử điểm của User đang đăng nhập (Khách hàng)
        [HttpGet("my-history")]
        public async Task<ActionResult<IEnumerable<PointTransaction>>> GetMyHistory()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            return await _context.PointTransactions
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        // CHỈ ADMIN MỚI ĐƯỢC XEM TẤT CẢ GIAO DỊCH
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<PointTransaction>>> GetPointTransactions() =>
            await _context.PointTransactions.ToListAsync();

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PointTransaction>> GetPointTransaction(int id)
        {
            var trans = await _context.PointTransactions.FindAsync(id);
            if (trans == null) return NotFound();
            return trans;
        }

        // CHỈ ADMIN MỚI ĐƯỢC TẠO GIAO DỊCH ĐIỂM THỦ CÔNG
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PointTransaction>> PostPointTransaction(PointTransaction trans)
        {
            trans.CreatedAt = DateTime.Now;
            _context.PointTransactions.Add(trans);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetPointTransaction", new { id = trans.Id }, trans);
        }

        // CHỈ ADMIN MỚI ĐƯỢC XÓA LỊCH SỬ ĐIỂM
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePointTransaction(int id)
        {
            var trans = await _context.PointTransactions.FindAsync(id);
            if (trans == null) return NotFound();
            _context.PointTransactions.Remove(trans);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("multiple")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMultiplePointTransactions([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids)) return BadRequest("Vui lòng nhập danh sách ID!");
            var idList = ids.Split(',').Select(i => i.Trim()).Where(i => int.TryParse(i, out _)).Select(int.Parse).ToList();
            var listToDelete = await _context.PointTransactions.Where(x => idList.Contains(x.Id)).ToListAsync();
            if (!listToDelete.Any()) return NotFound("Không tìm thấy dữ liệu để xóa!");

            _context.PointTransactions.RemoveRange(listToDelete);
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa thành công {listToDelete.Count} giao dịch điểm!" });
        }
    }
}