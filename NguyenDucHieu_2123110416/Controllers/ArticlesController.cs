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
    public class ArticlesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ArticlesController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // 1. LẤY CHI TIẾT BÀI VIẾT
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetArticle(int id)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null || article.IsDeleted) return NotFound();
            return Ok(article);
        }

        // 2. LẤY DANH SÁCH BÀI VIẾT (MỚI NHẤT LÊN ĐẦU)
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetArticles() =>
            Ok(await _context.Articles.Where(a => !a.IsDeleted).OrderByDescending(a => a.CreatedAt).ToListAsync());

        // 3. THÊM BÀI VIẾT MỚI
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromForm] string title, [FromForm] string content, [FromForm] IFormFile? image)
        {
            try
            {
                var adminIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (adminIdClaim == null) return Unauthorized(new { error = "Hết hạn đăng nhập sếp ơi!" });

                int adminId = int.Parse(adminIdClaim);
                string imgName = "default_post.jpg";

                if (image != null)
                {
                    imgName = await SaveArticleImage(image);
                }

                var article = new Article
                {
                    Title = title,
                    Content = content,
                    Slug = GenerateSlug(title),
                    Thumbnail = "/images/articles/" + imgName,
                    CreatedBy = adminId,
                    CreatedAt = DateTime.Now,
                    IsPublished = true,
                    IsDeleted = false
                };

                _context.Articles.Add(article);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Đã đăng bài viết thành công! 🖋️" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Lỗi hệ thống!", detail = ex.Message });
            }
        }

        // 4. CHỈNH SỬA BÀI VIẾT (Sử dụng POST để né lỗi 405 WebDAV)
        [HttpPost("update/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateArticle(int id, [FromForm] string title, [FromForm] string content, [FromForm] IFormFile? image)
        {
            try
            {
                var article = await _context.Articles.FindAsync(id);
                if (article == null || article.IsDeleted) return NotFound(new { error = "Không tìm thấy bài viết!" });

                // Cập nhật thông tin cơ bản
                article.Title = title;
                article.Content = content;
                article.Slug = GenerateSlug(title);
                article.UpdatedAt = DateTime.Now;
                article.UpdatedBy = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                // Xử lý ảnh mới nếu có
                if (image != null && image.Length > 0)
                {
                    string newImgName = await SaveArticleImage(image);
                    article.Thumbnail = "/images/articles/" + newImgName;
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật bài viết thành công! ✨" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Lỗi khi cập nhật!", detail = ex.Message });
            }
        }

        // 5. XÓA BÀI VIẾT (XÓA MỀM)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var art = await _context.Articles.FindAsync(id);
            if (art == null) return NotFound();
            art.IsDeleted = true;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa bài viết thành công!" });
        }

        // --- CÁC HÀM PHỤ TRỢ (PRIVATE HELPERS) ---

        private async Task<string> SaveArticleImage(IFormFile file)
        {
            string folderPath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "images", "articles");
            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

            string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            string fullPath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            return fileName;
        }

        private string GenerateSlug(string title)
        {
            // Chuyển tiêu đề thành slug đơn giản (Tùy biến thêm nếu cần)
            return title.ToLower().Replace(" ", "-").Trim();
        }
    }
}