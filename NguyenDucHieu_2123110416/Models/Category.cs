using System.ComponentModel.DataAnnotations;

namespace NguyenDucHieu_2123110416.Models
{
    // Kế thừa BaseAuditEntity để có 7 cột theo dõi
    public class Category : BaseAuditEntity
    {
        [Key] public int Id { get; set; }

        [Required(ErrorMessage = "Tên danh mục không được để trống")]
        [StringLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        public string ImageUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        // Quan hệ 1-nhiều với Product
        public ICollection<Product>? Products { get; set; } = new List<Product>();
    }
}