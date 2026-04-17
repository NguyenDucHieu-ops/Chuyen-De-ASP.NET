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
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ProductsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts() =>
            await _context.Products.Include(p => p.Category).Where(p => !p.IsDeleted).OrderByDescending(p => p.CreatedAt).ToListAsync();

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateProduct([FromForm] ProductCreateDTO request)
        {
            try
            {
                var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var file = request.ImageFile;
                if (file == null || file.Length == 0) return BadRequest(new { error = "Sếp chưa chọn ảnh!" });

                string folderPath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "images", "products");
                if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                using (var stream = new FileStream(Path.Combine(folderPath, fileName), FileMode.Create)) { await file.CopyToAsync(stream); }

                var product = new Product
                {
                    CategoryId = request.CategoryId,
                    ProductName = request.ProductName,
                    Description = request.Description ?? "",
                    BasePrice = request.BasePrice,
                    SizeUpPrice = request.SizeUpPrice,
                    SizeXlPrice = request.SizeXlPrice,
                    HasOptions = request.HasOptions,
                    ImageUrl = $"/images/products/{fileName}",
                    IsActive = true,
                    CreatedBy = adminId,
                    CreatedAt = DateTime.Now
                };
                _context.Products.Add(product);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Thêm thành công!", product });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        // 💡 ĐỔI TỪ [FromBody] SANG [FromForm] ĐỂ NHẬN ĐƯỢC FILE ẢNH
        public async Task<IActionResult> PutProduct(int id, [FromForm] ProductUpdateDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (id != dto.Id) return BadRequest(new { error = "ID lệch rồi sếp!" });

            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            try
            {
                product.ProductName = dto.ProductName;
                product.CategoryId = dto.CategoryId;
                product.Description = dto.Description ?? "";
                product.BasePrice = dto.BasePrice;
                product.SizeUpPrice = dto.SizeUpPrice;
                product.SizeXlPrice = dto.SizeXlPrice;
                product.HasOptions = dto.HasOptions;
                product.IsActive = dto.IsActive;
                product.UpdatedBy = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                product.UpdatedAt = DateTime.Now;

                // 💡 XỬ LÝ CẬP NHẬT ẢNH MỚI (NẾU CÓ)
                if (dto.ImageFile != null && dto.ImageFile.Length > 0)
                {
                    string folderPath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "images", "products");
                    if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.ImageFile.FileName);
                    using (var stream = new FileStream(Path.Combine(folderPath, fileName), FileMode.Create))
                    {
                        await dto.ImageFile.CopyToAsync(stream);
                    }
                    // Cập nhật đường dẫn ảnh mới
                    product.ImageUrl = $"/images/products/{fileName}";
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật xong rồi sếp!" });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            product.IsDeleted = true;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa!" });
        }
    }

    // 💡 THÊM ImageFile VÀO DTO ĐỂ NHẬN ẢNH TỪ FRONTEND
    public class ProductUpdateDTO
    {
        public int Id { get; set; }
        public string ProductName { get; set; } = null!;
        public int CategoryId { get; set; }
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public decimal SizeUpPrice { get; set; }
        public decimal SizeXlPrice { get; set; }
        public bool HasOptions { get; set; }
        public bool IsActive { get; set; }
        public IFormFile? ImageFile { get; set; } 
    }
}