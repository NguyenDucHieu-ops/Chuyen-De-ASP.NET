using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    // Thêm kế thừa BaseAuditEntity để đồng bộ hệ thống
    public class Order : BaseAuditEntity
    {
        [Key] public int Id { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")] public virtual User? User { get; set; } // Thêm ? để hết cảnh báo vàng

        public int AddressId { get; set; }
        [ForeignKey("AddressId")] public virtual UserAddress? UserAddress { get; set; }

        public int? VoucherId { get; set; }
        [ForeignKey("VoucherId")] public virtual Voucher? Voucher { get; set; }

        [Column(TypeName = "decimal(18,2)")] public decimal TotalAmount { get; set; }
        [Column(TypeName = "decimal(18,2)")] public decimal DiscountAmount { get; set; }
        [Column(TypeName = "decimal(18,2)")] public decimal FinalAmount { get; set; }

        [StringLength(50)] public string PaymentStatus { get; set; } = "Unpaid";
        [StringLength(50)] public string OrderStatus { get; set; } = "Pending";
        [StringLength(255)] public string OrderNote { get; set; } = string.Empty;

        // Lưu ý: Cột CreatedAt đã có trong BaseAuditEntity nên có thể xóa dòng cũ ở đây nếu muốn, 
        // nhưng để lại cũng không sao vì nó sẽ ghi đè.

        public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    }
}