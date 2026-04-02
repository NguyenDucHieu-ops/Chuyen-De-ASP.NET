namespace NguyenDucHieu_2123110416.DTOs
{
    public class CreateReviewDTO
    {
        public int ProductId { get; set; }
        public int OrderId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;

        // Nhận danh sách nhiều file ảnh cùng lúc
        public List<IFormFile>? Images { get; set; }
    }
}