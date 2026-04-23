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

        public decimal SizeXlPrice { get; set; }

        public bool HasOptions { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn hình ảnh sản phẩm!")]
        public IFormFile? ImageFile { get; set; }
    }
}