namespace NguyenDucHieu_2123110416.Models
{
    // Bảng nào kế thừa class này sẽ tự động mọc thêm 7 cột này trong Database
    public abstract class BaseAuditEntity
    {
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public int? CreatedBy { get; set; } // Lưu ID của ông Admin nào tạo

        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; } // Lưu ID của ông Admin nào sửa

        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        public int? DeletedBy { get; set; }
    }
}