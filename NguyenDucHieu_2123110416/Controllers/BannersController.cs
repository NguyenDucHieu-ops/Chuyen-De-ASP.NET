using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;
using System.Security.Claims;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/banners")] // 💡 Ép đường dẫn cố định là /api/banners
    [ApiController]
    [Authorize]
    public class BannersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public BannersController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetBanners() =>
            Ok(await _context.Banners.Where(b => !b.IsDeleted).OrderByDescending(b => b.CreatedAt).ToListAsync());

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromForm] BannerRequest request)
        {
            try
            {
                if (request.Image == null) return BadRequest("Chưa có ảnh!");
                string fileName = await SaveImage(request.Image);
                var banner = new Banner
                {
                    Title = request.Title,
                    LinkUrl = request.LinkUrl ?? "#",
                    ImageUrl = "/images/banners/" + fileName,
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    CreatedBy = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!)
                };
                _context.Banners.Add(banner);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Thêm thành công!" });
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        // 💡 ĐƯỜNG DẪN CỨNG: api/banners/update/{id}
        [HttpPost("update/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBanner(int id, [FromForm] BannerRequest request)
        {
            try
            {
                var banner = await _context.Banners.FindAsync(id);
                if (banner == null) return NotFound(new { message = "Không tìm thấy banner ID: " + id });

                banner.Title = request.Title;
                banner.LinkUrl = request.LinkUrl ?? "#";
                banner.UpdatedAt = DateTime.Now;
                banner.UpdatedBy = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                if (request.Image != null && request.Image.Length > 0)
                {
                    banner.ImageUrl = "/images/banners/" + await SaveImage(request.Image);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật thành công!" });
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null) return NotFound();
            banner.IsDeleted = true;
            await _context.SaveChangesAsync();
            return Ok();
        }

        private async Task<string> SaveImage(IFormFile file)
        {
            string folderPath = Path.Combine(_env.WebRootPath, "images", "banners");
            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);
            string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            string path = Path.Combine(folderPath, fileName);
            using (var stream = new FileStream(path, FileMode.Create)) { await file.CopyToAsync(stream); }
            return fileName;
        }
    }

    public class BannerRequest
    {
        public string Title { get; set; } = null!;
        public string? LinkUrl { get; set; }
        public IFormFile? Image { get; set; }
    }
}