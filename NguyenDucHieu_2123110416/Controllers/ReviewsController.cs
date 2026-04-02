using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.DTOs;
using NguyenDucHieu_2123110416.Models;
using System.Security.Claims;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ReviewsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpPost]
        public async Task<IActionResult> PostReview([FromForm] CreateReviewDTO request)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                // 1. KIỂM TRA ĐIỀU KIỆN: ĐÃ MUA HÀNG CHƯA?
                var hasOrdered = await _context.Orders.AnyAsync(o =>
                    o.Id == request.OrderId &&
                    o.UserId == userId &&
                    o.OrderStatus == "Completed"); // Chỉ đơn "Hoàn thành" mới được review

                if (!hasOrdered)
                    return BadRequest(new { error = "Bạn chỉ được đánh giá những sản phẩm đã mua và giao hàng thành công!" });

                // 2. TẠO REVIEW
                var review = new Review
                {
                    UserId = userId,
                    ProductId = request.ProductId,
                    OrderId = request.OrderId,
                    Rating = request.Rating,
                    Comment = request.Comment,
                    CreatedAt = DateTime.Now,
                    CreatedBy = userId
                };

                // 3. XỬ LÝ UPLOAD NHIỀU ẢNH
                if (request.Images != null && request.Images.Count > 0)
                {
                    string rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                    string folderPath = Path.Combine(rootPath, "images", "reviews");
                    if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                    foreach (var file in request.Images)
                    {
                        string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                        string filePath = Path.Combine(folderPath, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create)) { await file.CopyToAsync(stream); }

                        review.ReviewImages.Add(new ReviewImage { ImageUrl = $"/images/reviews/{fileName}" });
                    }
                }

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đánh giá thành công!", review });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpGet("product/{productId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductReviews(int productId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.ReviewImages)
                .Where(r => r.ProductId == productId && r.IsDeleted == false)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
            return Ok(reviews);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Chỉ người tạo hoặc Admin mới được xóa
            review.IsDeleted = true;
            review.DeletedAt = DateTime.Now;
            review.DeletedBy = userId;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa đánh giá!" });
        }
    }
}