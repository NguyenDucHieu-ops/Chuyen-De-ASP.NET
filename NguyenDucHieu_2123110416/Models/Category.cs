using System.ComponentModel.DataAnnotations;

namespace NguyenDucHieu_2123110416.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        public string ImageUrl { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        // Mối quan hệ 1-N: 1 Danh mục có nhiều Sản phẩm
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}