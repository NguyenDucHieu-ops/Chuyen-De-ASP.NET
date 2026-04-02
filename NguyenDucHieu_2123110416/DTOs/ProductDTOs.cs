using System.ComponentModel.DataAnnotations;

namespace NguyenDucHieu_2123110416.DTOs
{
    public class ProductCreateDTO
    {
        [Required] public int CategoryId { get; set; }

        [Required] public string ProductName { get; set; } = null!;
        public string Description { get; set; } = string.Empty;

        public decimal BasePrice { get; set; }
        public decimal SizeUpPrice { get; set; }
        public bool HasOptions { get; set; }

        // BÍ QUYẾT Ở ĐÂY: Kiểu dữ liệu IFormFile dùng để hứng file vật lý (.png, .jpg)
        [Required(ErrorMessage = "Vui lòng chọn hình ảnh sản phẩm!")]
        public IFormFile ImageFile { get; set; } = null!;
    }
}