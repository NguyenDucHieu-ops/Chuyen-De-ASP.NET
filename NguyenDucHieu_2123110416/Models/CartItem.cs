using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class CartItem
    {
        [Key]
        public int Id { get; set; }

        public int CartId { get; set; }
        [ForeignKey("CartId")]
        public Cart Cart { get; set; }

        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public Product Product { get; set; }

        public int Quantity { get; set; }

        [StringLength(10)]
        public string? Size { get; set; }

        [StringLength(20)]
        public string? IceLevel { get; set; }

        [StringLength(20)]
        public string? SugarLevel { get; set; }

        // Lưu danh sách ID Topping dưới dạng chuỗi (VD: "1,3,5") cho đơn giản khi ở giỏ hàng
        [StringLength(100)]
        public string? ToppingIds { get; set; }
    }
}