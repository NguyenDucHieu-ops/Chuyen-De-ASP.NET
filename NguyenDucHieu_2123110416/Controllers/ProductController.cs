using Microsoft.AspNetCore.Mvc;
using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        // Khởi tạo danh sách sản phẩm tĩnh có sẵn vài dữ liệu mẫu
        private static List<Product> products = new List<Product>
        {
            new Product { Id = 1, Name = "MacBook Pro M3", Price = 40000000, CategoryId = 1 },
            new Product { Id = 2, Name = "iPhone 15 Pro Max", Price = 30000000, CategoryId = 2 },
            new Product { Id = 3, Name = "Chuột Logitech Master 3s", Price = 2500000, CategoryId = 1 }
        };

        // 1. LẤY TOÀN BỘ DANH SÁCH SẢN PHẨM (GET)
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(products);
        }

        // 2. LẤY SẢN PHẨM THEO ID (GET)
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var product = products.FirstOrDefault(p => p.Id == id);
            if (product == null)
                return NotFound("Không tìm thấy sản phẩm này!");

            return Ok(product);
        }

        // 3. THÊM SẢN PHẨM MỚI (POST)
        [HttpPost]
        public IActionResult Create(Product newProduct)
        {
            // Tự động tăng ID cho sản phẩm mới
            newProduct.Id = products.Any() ? products.Max(p => p.Id) + 1 : 1;
            products.Add(newProduct);

            return Ok(newProduct);
        }

        // 4. SỬA THÔNG TIN SẢN PHẨM (PUT)
        [HttpPut("{id}")]
        public IActionResult Update(int id, Product updatedProduct)
        {
            var product = products.FirstOrDefault(p => p.Id == id);
            if (product == null)
                return NotFound("Không tìm thấy sản phẩm để sửa!");

            // Cập nhật các thông tin mới
            product.Name = updatedProduct.Name;
            product.Price = updatedProduct.Price;
            product.CategoryId = updatedProduct.CategoryId;

            return Ok(product);
        }

        // 5. XÓA SẢN PHẨM (DELETE)
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var product = products.FirstOrDefault(p => p.Id == id);
            if (product == null)
                return NotFound("Không tìm thấy sản phẩm để xóa!");

            products.Remove(product);
            return Ok("Đã xóa sản phẩm thành công!");
        }
    }
}