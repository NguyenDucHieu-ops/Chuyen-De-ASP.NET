using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NguyenDucHieu_2123110416.Models
{
    public class ReviewImage
    {
        [Key] public int Id { get; set; }
        public int ReviewId { get; set; }
        [ForeignKey("ReviewId")] public Review Review { get; set; }
        [Required] public string ImageUrl { get; set; } = string.Empty;
    }
}