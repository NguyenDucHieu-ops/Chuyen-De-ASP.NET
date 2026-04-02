using Microsoft.AspNetCore.Authorization; // Bắt buộc có để dùng Token
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.DTOs;
using NguyenDucHieu_2123110416.Models;
using System.Security.Claims; // Bắt buộc có để moi ID từ Token

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // LẮP Ổ KHÓA: Chỉ ai có Token mới được Thêm/Sửa/Xóa sản phẩm
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ProductsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // =================================================================================
        // KHÁCH HÀNG XEM MENU: MIỄN TRỪ TOKEN, VÀ CHỈ HIỂN THỊ MÓN "CHƯA BỊ XÓA"
        // =================================================================================
        [HttpGet]
        [AllowAnonymous] // Ai cũng xem được menu, không cần đăng nhập
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsDeleted == false) // BÍ QUYẾT: Giấu nhẹm những món đã xóa mềm
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id && p.IsDeleted == false); // Giấu món đã xóa

            if (product == null) return NotFound("Sản phẩm không tồn tại!");
            return product;
        }

        // =================================================================================
        // HÀM TẠO SẢN PHẨM: TỰ ĐỘNG GHI NHẬN NGƯỜI TẠO (CREATED_BY)
        // =================================================================================
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromForm] ProductCreateDTO request)
        {
            try
            {
                // MÓC ID TỪ TOKEN ĐỂ BIẾT ADMIN NÀO ĐANG ĐĂNG VÀO
                var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(adminIdString)) return Unauthorized("Token không hợp lệ!");
                int adminId = int.Parse(adminIdString);

                var file = request.ImageFile;
                if (file.Length == 0) return BadRequest(new { error = "File ảnh rỗng!" });

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
                    HasOptions = request.HasOptions,
                    ImageUrl = $"/images/products/{uniqueFileName}",
                    IsActive = true,

                    // GHI LOG HỆ THỐNG
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

        // =================================================================================
        // HÀM SỬA: GHI NHẬN NGƯỜI SỬA (UPDATED_BY) - (Phần ảnh tạm giữ nguyên chưa nâng cấp)
        // =================================================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id) return BadRequest("ID không khớp!");

            var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            product.UpdatedBy = int.Parse(adminIdString!);
            product.UpdatedAt = DateTime.Now;

            _context.Entry(product).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // =================================================================================
        // HÀM XÓA: NGHIỆP VỤ XÓA MỀM (SOFT DELETE) THẦN THÁNH
        // =================================================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || product.IsDeleted) return NotFound("Sản phẩm không tồn tại hoặc đã bị xóa!");

            var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            int adminId = int.Parse(adminIdString!);

            // THAY VÌ LỆNH REMOVE CŨ, CHÚNG TA CHỈ CẬP NHẬT TRẠNG THÁI
            product.IsDeleted = true;
            product.DeletedAt = DateTime.Now;
            product.DeletedBy = adminId; // Lưu dấu vết kẻ thủ ác đã xóa món này
            product.IsActive = false; // Ngừng bán trên Web luôn

            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã đưa sản phẩm '{product.ProductName}' vào thùng rác an toàn!" });
        }

        [HttpDelete("multiple")]
        public async Task<IActionResult> DeleteMultipleProducts([FromQuery] string ids)
        {
            if (string.IsNullOrWhiteSpace(ids)) return BadRequest("Vui lòng nhập danh sách ID!");

            var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            int adminId = int.Parse(adminIdString!);

            var idList = ids.Split(',')
                            .Select(i => i.Trim())
                            .Where(i => int.TryParse(i, out _))
                            .Select(int.Parse)
                            .ToList();

            var productsToDelete = await _context.Products
                                                 .Where(p => idList.Contains(p.Id) && p.IsDeleted == false)
                                                 .ToListAsync();

            if (!productsToDelete.Any()) return NotFound("Không tìm thấy sản phẩm hợp lệ nào để xóa!");

            // LẶP QUA TỪNG MÓN ĐỂ XÓA MỀM
            foreach (var product in productsToDelete)
            {
                product.IsDeleted = true;
                product.DeletedAt = DateTime.Now;
                product.DeletedBy = adminId;
                product.IsActive = false;
            }

            _context.Products.UpdateRange(productsToDelete);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã xóa mềm thành công {productsToDelete.Count} sản phẩm!" });
        }
    }
}