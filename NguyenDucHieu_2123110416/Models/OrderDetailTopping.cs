using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class OrderDetailTopping
    {
        [Key]
        public int Id { get; set; }

        public int OrderDetailId { get; set; }
        [ForeignKey("OrderDetailId")]
        public OrderDetail OrderDetail { get; set; }

        public int ToppingId { get; set; }
        [ForeignKey("ToppingId")]
        public Topping Topping { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ToppingPrice { get; set; }
    }
}