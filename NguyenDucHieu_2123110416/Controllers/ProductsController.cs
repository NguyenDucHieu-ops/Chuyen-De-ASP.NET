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
    [Authorize] // Bảo mật mặc định cho cả Class
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
        [AllowAnonymous] // Khách và Thầy đều xem được Menu
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsDeleted == false)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id && p.IsDeleted == false);

            if (product == null) return NotFound("Sản phẩm không tồn tại!");
            return product;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")] // CHỈ ADMIN MỚI ĐƯỢC THÊM
        public async Task<IActionResult> CreateProduct([FromForm] ProductCreateDTO request)
        {
            try
            {
                var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var file = request.ImageFile;
                if (file == null || file.Length == 0) return BadRequest(new { error = "Vui lòng chọn file ảnh!" });

                string rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                string folderPath = Path.Combine(rootPath, "images", "products");
                if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                string filePath = Path.Combine(folderPath, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create)) { await file.CopyToAsync(stream); }

                var product = new Product
                {
                    CategoryId = request.CategoryId,
                    ProductName = request.ProductName,
                    Description = request.Description,
                    BasePrice = request.BasePrice,
                    SizeUpPrice = request.SizeUpPrice,
                    SizeXlPrice = request.SizeXlPrice,
                    HasOptions = request.HasOptions,
                    ImageUrl = $"/images/products/{uniqueFileName}",
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
        [Authorize(Roles = "Admin")] // CHỈ ADMIN MỚI ĐƯỢC SỬA
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id) return BadRequest("ID không khớp!");
            product.UpdatedBy = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            product.UpdatedAt = DateTime.Now;
            _context.Entry(product).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // CHỈ ADMIN MỚI ĐƯỢC XÓA
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || product.IsDeleted) return NotFound();
            product.IsDeleted = true;
            product.DeletedAt = DateTime.Now;
            product.DeletedBy = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            product.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã xóa món '{product.ProductName}'!" });
        }
    }
}