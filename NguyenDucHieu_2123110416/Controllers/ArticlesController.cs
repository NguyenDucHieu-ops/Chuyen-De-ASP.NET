using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Text;

namespace NguyenDucHieu_2123110416.Controllers
{
    public class ArticleRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public IFormFile? Image { get; set; }
    }

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

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetArticle(int id)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null || article.IsDeleted) return NotFound();
            return Ok(article);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetArticles() =>
            Ok(await _context.Articles.Where(a => !a.IsDeleted).OrderByDescending(a => a.CreatedAt).ToListAsync());

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromForm] ArticleRequest request)
        {
            try
            {
                var adminIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (adminIdClaim == null) return Unauthorized(new { error = "Hết hạn đăng nhập!" });

                string imgName = "default_post.jpg";
                if (request.Image != null) imgName = await SaveArticleImage(request.Image);

                var article = new Article
                {
                    Title = request.Title,
                    Content = request.Content,
                    Slug = GenerateSlug(request.Title),
                    Thumbnail = "/images/articles/" + imgName,
                    CreatedBy = int.Parse(adminIdClaim),
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

        [HttpPost("update/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateArticle(int id, [FromForm] ArticleRequest request)
        {
            try
            {
                var article = await _context.Articles.FindAsync(id);
                if (article == null || article.IsDeleted) return NotFound();

                article.Title = request.Title;
                article.Content = request.Content;
                article.Slug = GenerateSlug(request.Title);
                article.UpdatedAt = DateTime.Now;
                article.UpdatedBy = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                if (request.Image != null)
                {
                    article.Thumbnail = "/images/articles/" + await SaveArticleImage(request.Image);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật thành công! ✨" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Lỗi!", detail = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var art = await _context.Articles.FindAsync(id);
            if (art == null) return NotFound();
            art.IsDeleted = true;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa!" });
        }

        private async Task<string> SaveArticleImage(IFormFile file)
        {
            // Fix đường dẫn cho Linux (Render)
            string rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            string folderPath = Path.Combine(rootPath, "images", "articles");

            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

            string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            string filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            return fileName;
        }

        private string GenerateSlug(string title)
        {
            // Logic xóa dấu tiếng Việt cho link đẹp
            string str = title.ToLower().Trim();
            str = Regex.Replace(str, @"[áàảãạâấầẩẫậăắằẳẵặ]", "a");
            str = Regex.Replace(str, @"[éèẻẽẹêếềểễệ]", "e");
            str = Regex.Replace(str, @"[íìỉĩị]", "i");
            str = Regex.Replace(str, @"[óòỏõọôốồổỗộơớờởỡợ]", "o");
            str = Regex.Replace(str, @"[úùủũụưứừửữự]", "u");
            str = Regex.Replace(str, @"[ýỳỷỹỵ]", "y");
            str = Regex.Replace(str, @"[đ]", "d");
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
            str = Regex.Replace(str, @"\s+", "-").Trim();
            str = Regex.Replace(str, @"-+", "-");
            return str;
        }
    }
}