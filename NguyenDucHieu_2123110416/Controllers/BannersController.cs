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
        [AllowAnonymous] // Khách xem trang chủ thấy banner
        public async Task<ActionResult<IEnumerable<Banner>>> GetBanners()
        {
            return await _context.Banners
                .Where(b => b.IsDeleted == false && b.IsActive == true)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<IActionResult> PostBanner([FromForm] BannerCreateDTO request)
        {
            try
            {
                var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                // 1. Xử lý Upload Ảnh
                var file = request.ImageFile;
                if (file == null || file.Length == 0) return BadRequest("Vui lòng chọn ảnh!");

                string rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                string folderPath = Path.Combine(rootPath, "images", "banners");
                if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                string filePath = Path.Combine(folderPath, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // 2. Lưu Database
                var banner = new Banner
                {
                    Title = request.Title,
                    LinkUrl = request.LinkUrl,
                    IsActive = request.IsActive,
                    ImageUrl = $"/images/banners/{uniqueFileName}",
                    CreatedBy = adminId,
                    CreatedAt = DateTime.Now
                };

                _context.Banners.Add(banner);
                await _context.SaveChangesAsync();
                return Ok(banner);
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBanner(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null || banner.IsDeleted) return NotFound();

            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            banner.IsDeleted = true;
            banner.DeletedAt = DateTime.Now;
            banner.DeletedBy = adminId;
            banner.IsActive = false;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa banner thành công!" });
        }
    }
}