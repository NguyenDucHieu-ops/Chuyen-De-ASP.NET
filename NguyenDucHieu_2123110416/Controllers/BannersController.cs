using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BannersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BannersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Banner>>> GetBanners() => await _context.Banners.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Banner>> GetBanner(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null) return NotFound();
            return banner;
        }

        [HttpPost]
        public async Task<ActionResult<Banner>> PostBanner(Banner banner)
        {
            _context.Banners.Add(banner);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetBanner", new { id = banner.Id }, banner);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutBanner(int id, Banner banner)
        {
            if (id != banner.Id) return BadRequest("ID không khớp");
            _context.Entry(banner).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBanner(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null) return NotFound();
            _context.Banners.Remove(banner);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("multiple")]
        public async Task<IActionResult> DeleteMultipleBanners([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids)) return BadRequest("Vui lòng nhập danh sách ID!");
            var idList = ids.Split(',').Select(i => i.Trim()).Where(i => int.TryParse(i, out _)).Select(int.Parse).ToList();
            var bannersToDelete = await _context.Banners.Where(b => idList.Contains(b.Id)).ToListAsync();
            if (!bannersToDelete.Any()) return NotFound("Không tìm thấy banner nào để xóa!");

            _context.Banners.RemoveRange(bannersToDelete);
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa thành công {bannersToDelete.Count} banner!" });
        }
    }
}