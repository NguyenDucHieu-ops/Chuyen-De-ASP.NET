using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class Review
    {
        [Key] public int Id { get; set; }
        public int UserId { get; set; }
        [ForeignKey("UserId")] public User User { get; set; }

        public int ProductId { get; set; }
        [ForeignKey("ProductId")] public Product Product { get; set; }

        public int OrderId { get; set; }
        [ForeignKey("OrderId")] public Order Order { get; set; }

        [Range(1, 5)] public int Rating { get; set; }
        [StringLength(500)] public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public ICollection<ReviewImage> ReviewImages { get; set; } = new List<ReviewImage>();
    }
}