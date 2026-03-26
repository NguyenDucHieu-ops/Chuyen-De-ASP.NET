using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class OrderDetail
    {
        [Key] public int Id { get; set; }
        public int OrderId { get; set; }
        [ForeignKey("OrderId")] public Order Order { get; set; }

        public int ProductId { get; set; }
        [ForeignKey("ProductId")] public Product Product { get; set; }

        public int Quantity { get; set; }
        [StringLength(10)] public string? Size { get; set; }
        [StringLength(20)] public string? IceLevel { get; set; }
        [StringLength(20)] public string? SugarLevel { get; set; }

        [Column(TypeName = "decimal(18,2)")] public decimal UnitPrice { get; set; }
        [Column(TypeName = "decimal(18,2)")] public decimal TotalPrice { get; set; }

        public ICollection<OrderDetailTopping> OrderDetailToppings { get; set; } = new List<OrderDetailTopping>();
    }
}