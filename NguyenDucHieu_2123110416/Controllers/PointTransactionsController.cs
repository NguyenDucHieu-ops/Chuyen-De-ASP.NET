using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PointTransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PointTransactionsController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PointTransaction>>> GetPointTransactions() => await _context.PointTransactions.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<PointTransaction>> GetPointTransaction(int id)
        {
            var trans = await _context.PointTransactions.FindAsync(id);
            if (trans == null) return NotFound();
            return trans;
        }

        [HttpPost]
        public async Task<ActionResult<PointTransaction>> PostPointTransaction(PointTransaction trans)
        {
            _context.PointTransactions.Add(trans);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetPointTransaction", new { id = trans.Id }, trans);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPointTransaction(int id, PointTransaction trans)
        {
            if (id != trans.Id) return BadRequest("ID không khớp!");
            _context.Entry(trans).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePointTransaction(int id)
        {
            var trans = await _context.PointTransactions.FindAsync(id);
            if (trans == null) return NotFound();
            _context.PointTransactions.Remove(trans);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("multiple")]
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