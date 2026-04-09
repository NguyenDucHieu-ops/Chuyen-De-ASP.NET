using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    // Đã kế thừa BaseAuditEntity (Tốt)
    public class Voucher : BaseAuditEntity
    {
        [Key]
        public int Id { get; set; }

        // 1. Đổi VoucherCode thành Code
        [Required(ErrorMessage = "Mã Voucher không được để trống")]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;

        // 2. Gom hết mớ % và điều kiện lằng nhằng lại thành 1 cột giảm tiền mặt
        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; }

        // 3. Đổi Start/End thành ExpiryDate cho gọn
        public DateTime ExpiryDate { get; set; }

        public bool IsActive { get; set; } = true;
    }
}