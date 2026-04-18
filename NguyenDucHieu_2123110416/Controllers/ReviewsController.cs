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
    [Authorize] // 🔒 Mặc định khóa tất cả để bảo mật
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ReviewsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // ====================================================
        // 1. API CHO KHÁCH HÀNG ĐĂNG REVIEW
        // ====================================================
        [HttpPost]
        public async Task<IActionResult> PostReview([FromForm] CreateReviewDTO request)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                // Kiểm tra đơn hàng có tồn tại và đã hoàn thành chưa (Bắt "2" hoặc "Completed")
                var order = await _context.Orders.FirstOrDefaultAsync(o =>
                     o.Id == request.OrderId &&
                     o.UserId == userId &&
                     (o.OrderStatus.ToString() == "2" || o.OrderStatus.ToString() == "Completed"));

                if (order == null)
                    return BadRequest(new { error = "Bạn chỉ được đánh giá những sản phẩm đã mua thành công!" });

                // 💡 KIỂM TRA THỜI HẠN 2 NGÀY
                var completedDate = order.UpdatedAt ?? order.CreatedAt;
                if ((DateTime.Now - completedDate).TotalDays > 2)
                {
                    return BadRequest(new { error = "Đã quá thời hạn 2 ngày để đánh giá đơn hàng này!" });
                }

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

        // ====================================================
        // 2. API CHO KHÁCH XEM REVIEW TẠI TRANG CHI TIẾT SẢN PHẨM
        // ====================================================
        [HttpGet("product/{productId}")]
        [AllowAnonymous] // 🔓 Cho phép xem không cần đăng nhập
        public async Task<IActionResult> GetProductReviews(int productId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.ReviewImages)
                .Where(r => r.ProductId == productId && r.IsDeleted == false)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new {
                    r.Id,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt,
                    r.OrderId,
                    r.AdminReply,
                    CustomerName = r.User != null ? r.User.FullName : "Ẩn danh",
                    Images = r.ReviewImages.Select(img => img.ImageUrl).ToList()
                })
                .ToListAsync();
            return Ok(reviews);
        }

        // ====================================================
        // 3. API LẤY TOÀN BỘ ĐÁNH GIÁ (Dành cho Trang Chủ & Admin Manager)
        // ====================================================
        [HttpGet]
        [AllowAnonymous] // 🔓 Mở cửa để Trang Chủ load được data (Fix lỗi 401)
        public async Task<IActionResult> GetAllReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Product) // 💡 Join để lấy tên món ăn
                .Include(r => r.ReviewImages)
                .Where(r => r.IsDeleted == false)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new {
                    id = r.Id,
                    userId = r.UserId,
                    rating = r.Rating,
                    comment = r.Comment,
                    createdAt = r.CreatedAt,
                    orderId = r.OrderId,
                    adminReply = r.AdminReply,
                    // 💡 Lấy tên món ăn gửi xuống React
                    productName = r.Product != null ? r.Product.ProductName : "Sản phẩm đã ẩn",
                    user = new { fullName = r.User != null ? r.User.FullName : "Ẩn danh" },
                    reviewImages = r.ReviewImages.Select(img => new { imageUrl = img.ImageUrl }).ToList()
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // ====================================================
        // 4. API ADMIN GỬI PHẢN HỒI CHO KHÁCH HÀNG
        // ====================================================
        [HttpPut("{id}/reply")]
        [Authorize(Roles = "Admin")] // 🔒 Chỉ Admin mới được quyền phản hồi
        public async Task<IActionResult> ReplyReview(int id, [FromBody] string replyText)
        {
            try
            {
                var review = await _context.Reviews.FindAsync(id);
                if (review == null || review.IsDeleted)
                    return NotFound(new { error = "Không tìm thấy đánh giá để phản hồi!" });

                review.AdminReply = replyText;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đã gửi phản hồi thành công! ✨" });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        // ====================================================
        // 5. API XÓA REVIEW (Xóa mềm - IsDeleted)
        // ====================================================
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null || review.IsDeleted) return NotFound();

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            // Kiểm tra quyền: Chỉ chủ sở hữu hoặc Admin mới được xóa
            if (review.UserId != userId && userRole != "Admin")
            {
                return Forbid();
            }

            review.IsDeleted = true;
            review.DeletedAt = DateTime.Now;
            review.DeletedBy = userId;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa đánh giá thành công!" });
        }
    }
}