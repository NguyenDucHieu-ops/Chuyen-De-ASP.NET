using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Models;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NguyenDucHieu_2123110416.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // --- DANH SÁCH 15 BẢNG (DbSet) ---
        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserAddress> UserAddresses { get; set; }
        public DbSet<PointTransaction> PointTransactions { get; set; }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Topping> Toppings { get; set; }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<OrderDetailTopping> OrderDetailToppings { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReviewImage> ReviewImages { get; set; }
        public DbSet<Banner> Banners { get; set; }

        // --- CẤU HÌNH & TẠO DỮ LIỆU MẪU (SEED DATA) ---
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Cấu hình chống xóa dây chuyền (Bảo vệ dữ liệu lịch sử)
            foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }

            // 2. SEED DATA - Tự động nạp dữ liệu mẫu khi chạy Update-Database
            var now = DateTime.Now;

            // Nạp Quyền (Roles)
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin", IsActive = true, CreatedAt = now },
                new Role { Id = 2, Name = "Customer", IsActive = true, CreatedAt = now }
            );

            // Nạp Danh mục (Categories)
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, CategoryName = "Trà Sữa", ImageUrl = "trasua_thumb.jpg", IsActive = true, CreatedAt = now },
                new Category { Id = 2, CategoryName = "Cà Phê", ImageUrl = "caphe_thumb.jpg", IsActive = true, CreatedAt = now },
                new Category { Id = 3, CategoryName = "Đồ Ăn Vặt", ImageUrl = "snack_thumb.jpg", IsActive = true, CreatedAt = now }
            );

            // Nạp Sản phẩm (Products)
            modelBuilder.Entity<Product>().HasData(
                new Product
                {
                    Id = 1,
                    CategoryId = 1,
                    ProductName = "Trà Sữa Trân Châu Đường Đen",
                    Description = "Vị ngọt thanh, đậm đà",
                    BasePrice = 35000,
                    SizeUpPrice = 5000,
                    HasOptions = true,
                    ImageUrl = "trasua_duongden.jpg",
                    IsActive = true,
                    CreatedAt = now
                },
                new Product
                {
                    Id = 2,
                    CategoryId = 2,
                    ProductName = "Cà Phê Muối",
                    Description = "Đặc sản xứ Huế",
                    BasePrice = 29000,
                    SizeUpPrice = 0,
                    HasOptions = true,
                    ImageUrl = "caphe_muoi.jpg",
                    IsActive = true,
                    CreatedAt = now
                },
                new Product
                {
                    Id = 3,
                    CategoryId = 3,
                    ProductName = "Bánh Tráng Trộn",
                    Description = "Chua cay mặn ngọt đủ vị",
                    BasePrice = 20000,
                    SizeUpPrice = 0,
                    HasOptions = false,
                    ImageUrl = "banh_trang.jpg",
                    IsActive = true,
                    CreatedAt = now
                }
            );

            // Nạp Topping (Toppings)
            modelBuilder.Entity<Topping>().HasData(
                new Topping { Id = 1, ToppingName = "Trân Châu Trắng", Price = 5000, IsActive = true, CreatedAt = now },
                new Topping { Id = 2, ToppingName = "Trân Châu Đen", Price = 5000, IsActive = true, CreatedAt = now },
                new Topping { Id = 3, ToppingName = "Kem Cheese", Price = 10000, IsActive = true, CreatedAt = now }
            );

            // Nạp Khuyến mãi (Vouchers)
            modelBuilder.Entity<Voucher>().HasData(
                new Voucher { Id = 1, Code = "HIEUVIP", DiscountAmount = 15000, ExpiryDate = now.AddDays(30), IsActive = true, CreatedAt = now },
                new Voucher { Id = 2, Code = "FREESHIP", DiscountAmount = 10000, ExpiryDate = now.AddDays(15), IsActive = true, CreatedAt = now }
            );

            // Nạp Quảng cáo (Banners)
            modelBuilder.Entity<Banner>().HasData(
                new Banner { Id = 1, Title = "Đón Hè Cùng Trà Sữa", ImageUrl = "banner_he.jpg", LinkUrl = "/products", IsActive = true, CreatedAt = now }
            );
        }

        // ============================================================
        // 🔥 PHẦN NÂNG CẤP: TỰ ĐỘNG ĐIỀN NGÀY GIỜ (AUDIT LOGGING)
        // ============================================================
        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // Tìm tất cả các thực thể đang được thêm mới hoặc chỉnh sửa mà có kế thừa BaseAuditEntity
            var entries = ChangeTracker.Entries()
                .Where(e => e.Entity is BaseAuditEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entityEntry in entries)
            {
                var entity = (BaseAuditEntity)entityEntry.Entity;
                var now = DateTime.Now;

                if (entityEntry.State == EntityState.Added)
                {
                    entity.CreatedAt = now;
                    entity.IsDeleted = false; // Luôn mặc định là chưa xóa khi tạo mới
                }
                else if (entityEntry.State == EntityState.Modified)
                {
                    // Nếu là sửa dữ liệu, ta giữ nguyên ngày tạo và cập nhật ngày sửa
                    Entry(entity).Property(x => x.CreatedAt).IsModified = false;
                    entity.UpdatedAt = now;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
}