using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class Order
    {
        [Key] public int Id { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")] public User User { get; set; }

        public int AddressId { get; set; }
        [ForeignKey("AddressId")] public UserAddress UserAddress { get; set; }

        public int? VoucherId { get; set; }
        [ForeignKey("VoucherId")] public Voucher? Voucher { get; set; }

        [Column(TypeName = "decimal(18,2)")] public decimal TotalAmount { get; set; }
        [Column(TypeName = "decimal(18,2)")] public decimal DiscountAmount { get; set; }
        [Column(TypeName = "decimal(18,2)")] public decimal FinalAmount { get; set; }

        [StringLength(50)] public string PaymentStatus { get; set; } = "Unpaid";
        [StringLength(50)] public string OrderStatus { get; set; } = "Pending";
        [StringLength(255)] public string OrderNote { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    }
}