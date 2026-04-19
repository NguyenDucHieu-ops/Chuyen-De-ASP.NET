using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class Order : BaseAuditEntity
    {
        [Key] public int Id { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")] public virtual User? User { get; set; }

        public int AddressId { get; set; }
        [ForeignKey("AddressId")] public virtual UserAddress? UserAddress { get; set; }

        public int? VoucherId { get; set; }
        [ForeignKey("VoucherId")] public virtual Voucher? Voucher { get; set; }

        [Column(TypeName = "decimal(18,2)")] public decimal TotalAmount { get; set; }

        // 💡 BỔ SUNG CỘT LƯU PHÍ SHIP VÀO ĐÂY
        [Column(TypeName = "decimal(18,2)")] public decimal ShippingFee { get; set; }

        [Column(TypeName = "decimal(18,2)")] public decimal DiscountAmount { get; set; }
        [Column(TypeName = "decimal(18,2)")] public decimal FinalAmount { get; set; }

        [StringLength(50)] public string PaymentStatus { get; set; } = "Unpaid";
        [StringLength(50)] public string OrderStatus { get; set; } = "Pending";
        [StringLength(255)] public string OrderNote { get; set; } = string.Empty;

        public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    }
}