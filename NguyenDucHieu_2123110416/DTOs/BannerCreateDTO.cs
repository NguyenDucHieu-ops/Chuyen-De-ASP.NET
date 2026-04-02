namespace NguyenDucHieu_2123110416.DTOs
{
    public class BannerCreateDTO
    {
        public string Title { get; set; } = string.Empty;
        public string LinkUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public IFormFile ImageFile { get; set; } = null!; // File ảnh thực tế
    }
}