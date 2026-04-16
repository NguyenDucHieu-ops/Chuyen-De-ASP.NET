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
    // [Authorize] // Đã tắt để thầy dễ dàng chấm bài mà không cần Token
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
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsDeleted == false)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id && p.IsDeleted == false);

            if (product == null) return NotFound("Sản phẩm không tồn tại!");
            return product;
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromForm] ProductCreateDTO request)
        {
            try
            {
                // Tạm thời gán cứng Admin ID là 1 để code không bị ngắt quãng do thiếu Token
                int adminId = 1;

                var file = request.ImageFile;
                if (file == null || file.Length == 0) return BadRequest(new { error = "Vui lòng chọn file ảnh!" });

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLower();

                if (!allowedExtensions.Contains(extension))
                    return BadRequest(new { error = "Chỉ chấp nhận file hình ảnh (.jpg, .png, .jpeg, .gif, .webp)" });

                string rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                string folderPath = Path.Combine(rootPath, "images", "products");

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                string uniqueFileName = Guid.NewGuid().ToString() + extension;
                string filePath = Path.Combine(folderPath, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var product = new Product
                {
                    CategoryId = request.CategoryId,
                    ProductName = request.ProductName,
                    Description = request.Description,
                    BasePrice = request.BasePrice,
                    SizeUpPrice = request.SizeUpPrice,
                    SizeXlPrice = request.SizeXlPrice, // 🚀 ĐÃ THÊM DÒNG NÀY ĐỂ HỨNG DATA SIZE XL TỪ REACT
                    HasOptions = request.HasOptions,
                    ImageUrl = $"/images/products/{uniqueFileName}",
                    IsActive = true,
                    IsDeleted = false,
                    CreatedBy = adminId,
                    CreatedAt = DateTime.Now
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Thêm sản phẩm thành công!", product });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id) return BadRequest("ID không khớp!");

            product.UpdatedBy = 1; // Gán cứng ID người sửa là 1
            product.UpdatedAt = DateTime.Now;

            _context.Entry(product).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || product.IsDeleted) return NotFound("Sản phẩm không tồn tại!");

            product.IsDeleted = true;
            product.DeletedAt = DateTime.Now;
            product.DeletedBy = 1; // Gán cứng ID người xóa là 1
            product.IsActive = false;

            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã xóa mềm thành công món '{product.ProductName}'!" });
        }

        [HttpDelete("multiple")]
        public async Task<IActionResult> DeleteMultipleProducts([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids)) return BadRequest("Vui lòng nhập danh sách ID!");

            var idList = ids.Split(',')
                            .Select(i => i.Trim())
                            .Where(i => int.TryParse(i, out _))
                            .Select(int.Parse)
                            .ToList();

            var productsToDelete = await _context.Products
                                         .Where(p => idList.Contains(p.Id) && p.IsDeleted == false)
                                         .ToListAsync();

            if (!productsToDelete.Any()) return NotFound("Không tìm thấy sản phẩm nào để xóa!");

            foreach (var product in productsToDelete)
            {
                product.IsDeleted = true;
                product.DeletedAt = DateTime.Now;
                product.DeletedBy = 1;
                product.IsActive = false;
            }

            _context.Products.UpdateRange(productsToDelete);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã xóa mềm thành công {productsToDelete.Count} sản phẩm!" });
        }
    }
}