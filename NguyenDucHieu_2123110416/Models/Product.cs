using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class Product : BaseAuditEntity
    {
        [Key] public int Id { get; set; }
        public int CategoryId { get; set; }
        [ForeignKey("CategoryId")] public Category? Category { get; set; }

        [Required, StringLength(150)] public string ProductName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")] public decimal BasePrice { get; set; }
        [Column(TypeName = "decimal(18,2)")] public decimal SizeUpPrice { get; set; }

        // 👇 THÊM DÒNG NÀY (Giá cộng thêm cho size XL)
        [Column(TypeName = "decimal(18,2)")] public decimal SizeXlPrice { get; set; }

        public bool HasOptions { get; set; } = true;
        public bool IsActive { get; set; } = true;
    }
}