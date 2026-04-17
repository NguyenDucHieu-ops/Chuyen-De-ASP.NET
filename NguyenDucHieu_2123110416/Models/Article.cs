using System.ComponentModel.DataAnnotations;

namespace NguyenDucHieu_2123110416.Models
{
    public class Article : BaseAuditEntity 
    {
        [Key]
        public int Id { get; set; }

        [Required, StringLength(250)]
        public string Title { get; set; } = string.Empty;

        [Required, StringLength(250)]
        public string Slug { get; set; } = string.Empty; // Đường dẫn kiểu: tin-tuc-hieu-store

        public string? Thumbnail { get; set; } // Ảnh bìa bài viết

        [Required]
        public string Content { get; set; } = string.Empty; // Nội dung bài viết (Lưu mã HTML)

        public bool IsPublished { get; set; } = true; // Xuất bản hay Lưu nháp
    }
}