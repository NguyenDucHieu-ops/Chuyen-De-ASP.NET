using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace NguyenDucHieu_2123110416.Models
{
    public class ReviewImage
    {
        [Key] public int Id { get; set; }
        public int ReviewId { get; set; }

        [ForeignKey("ReviewId")]
        [JsonIgnore] // Để tránh vòng lặp JSON khi trả về dữ liệu
        public Review? Review { get; set; }

        [Required] public string ImageUrl { get; set; } = string.Empty;
    }
}