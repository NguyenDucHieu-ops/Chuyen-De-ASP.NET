using Microsoft.AspNetCore.Mvc;
using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        // Tạo một danh sách tĩnh (static) để lưu dữ liệu tạm vào RAM
        private static List<Category> categories = new List<Category>
        {
            new Category { Id = 1, Name = "Laptop" },
            new Category { Id = 2, Name = "Điện thoại" }
        };

        // 1. LẤY DANH SÁCH (GET)
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(categories);
        }

        // 2. LẤY THEO ID (GET)
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var category = categories.FirstOrDefault(c => c.Id == id);
            if (category == null)
                return NotFound("Không tìm thấy danh mục này!");

            return Ok(category);
        }

        // 3. THÊM MỚI (POST)
        [HttpPost]
        public IActionResult Create(Category newCategory)
        {
            // Tự động tăng ID
            newCategory.Id = categories.Any() ? categories.Max(c => c.Id) + 1 : 1;
            categories.Add(newCategory);

            return Ok(newCategory);
        }

        // 4. SỬA (PUT)
        [HttpPut("{id}")]
        public IActionResult Update(int id, Category updatedCategory)
        {
            var category = categories.FirstOrDefault(c => c.Id == id);
            if (category == null)
                return NotFound("Không tìm thấy danh mục để sửa!");

            category.Name = updatedCategory.Name; // Cập nhật tên mới
            return Ok(category);
        }

        // 5. XÓA (DELETE)
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var category = categories.FirstOrDefault(c => c.Id == id);
            if (category == null)
                return NotFound("Không tìm thấy danh mục để xóa!");

            categories.Remove(category);
            return Ok("Đã xóa thành công!");
        }
    }
}