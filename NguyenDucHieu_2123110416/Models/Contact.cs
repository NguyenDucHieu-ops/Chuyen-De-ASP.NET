namespace NguyenDucHieu_2123110416.Models
{
    public class Contact : BaseAuditEntity
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false; // Admin đã đọc chưa
        public bool IsReplied { get; set; } = false;
        public string? ReplyMessage { get; set; }
    }
}
