using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewImagesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ReviewImagesController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReviewImage>>> GetReviewImages() => await _context.ReviewImages.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<ReviewImage>> GetReviewImage(int id)
        {
            var image = await _context.ReviewImages.FindAsync(id);
            if (image == null) return NotFound();
            return image;
        }

        [HttpPost]
        public async Task<ActionResult<ReviewImage>> PostReviewImage(ReviewImage image)
        {
            _context.ReviewImages.Add(image);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetReviewImage", new { id = image.Id }, image);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutReviewImage(int id, ReviewImage image)
        {
            if (id != image.Id) return BadRequest("ID không khớp!");
            _context.Entry(image).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReviewImage(int id)
        {
            var image = await _context.ReviewImages.FindAsync(id);
            if (image == null) return NotFound();
            _context.ReviewImages.Remove(image);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("multiple")]
        public async Task<IActionResult> DeleteMultipleReviewImages([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids)) return BadRequest("Vui lòng nhập danh sách ID!");
            var idList = ids.Split(',').Select(i => i.Trim()).Where(i => int.TryParse(i, out _)).Select(int.Parse).ToList();
            var listToDelete = await _context.ReviewImages.Where(x => idList.Contains(x.Id)).ToListAsync();
            if (!listToDelete.Any()) return NotFound("Không tìm thấy dữ liệu để xóa!");

            _context.ReviewImages.RemoveRange(listToDelete);
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa thành công {listToDelete.Count} ảnh đánh giá!" });
        }
    }
}