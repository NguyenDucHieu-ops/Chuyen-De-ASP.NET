using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class Voucher : BaseAuditEntity
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Mã Voucher không được để trống")]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; }

        public DateTime ExpiryDate { get; set; }

        public bool IsActive { get; set; } = true;

        // 💡 THÊM 2 DÒNG NÀY:
        public int PointsRequired { get; set; } = 0; // 0 nghĩa là Voucher miễn phí (ai cũng lấy được)
        public string Description { get; set; } = string.Empty; // Mô tả ngắn gọn cho khách hiểu
    }
}