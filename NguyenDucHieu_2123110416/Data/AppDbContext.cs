using Microsoft.AspNetCore.Http;
using Microsoft.CodeAnalysis.Elfie.Serialization;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace NguyenDucHieu_2123110416.Data
{
    public class AppDbContext : DbContext
    {
        // Thêm cái này để đọc được ID của Admin từ Token
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AppDbContext(DbContextOptions<AppDbContext> options, IHttpContextAccessor httpContextAccessor) : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        // --- DANH SÁCH BẢNG (DbSet) ---
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
        public DbSet<Article> Articles { get; set; }

        // 💡 ĐÃ THÊM BẢNG NOTIFICATION ĐỂ LƯU THÔNG BÁO QUẢ CHUÔNG
        public DbSet<Notification> Notifications { get; set; }

        // 👇 BẢNG LƯU NHẬT KÝ HỆ THỐNG
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        public DbSet<Reward> Rewards { get; set; }
        // --- CẤU HÌNH & TẠO DỮ LIỆU MẪU (SEED DATA) ---
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Cấu hình chống xóa dây chuyền
            foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }

            // 2. SEED DATA - Tự động nạp dữ liệu mẫu
            var now = DateTime.Now;

            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin", IsActive = true, CreatedAt = now },
                new Role { Id = 2, Name = "Customer", IsActive = true, CreatedAt = now }
            );

            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, CategoryName = "Trà Sữa", ImageUrl = "trasua_thumb.jpg", IsActive = true, CreatedAt = now },
                new Category { Id = 2, CategoryName = "Cà Phê", ImageUrl = "caphe_thumb.jpg", IsActive = true, CreatedAt = now },
                new Category { Id = 3, CategoryName = "Đồ Ăn Vặt", ImageUrl = "snack_thumb.jpg", IsActive = true, CreatedAt = now }
            );

            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, CategoryId = 1, ProductName = "Trà Sữa Trân Châu Đường Đen", Description = "Vị ngọt thanh, đậm đà", BasePrice = 35000, SizeUpPrice = 5000, HasOptions = true, ImageUrl = "trasua_duongden.jpg", IsActive = true, CreatedAt = now },
                new Product { Id = 2, CategoryId = 2, ProductName = "Cà Phê Muối", Description = "Đặc sản xứ Huế", BasePrice = 29000, SizeUpPrice = 0, HasOptions = true, ImageUrl = "caphe_muoi.jpg", IsActive = true, CreatedAt = now },
                new Product { Id = 3, CategoryId = 3, ProductName = "Bánh Tráng Trộn", Description = "Chua cay mặn ngọt đủ vị", BasePrice = 20000, SizeUpPrice = 0, HasOptions = false, ImageUrl = "banh_trang.jpg", IsActive = true, CreatedAt = now }
            );

            modelBuilder.Entity<Topping>().HasData(
                new Topping { Id = 1, ToppingName = "Trân Châu Trắng", Price = 5000, IsActive = true, CreatedAt = now },
                new Topping { Id = 2, ToppingName = "Trân Châu Đen", Price = 5000, IsActive = true, CreatedAt = now },
                new Topping { Id = 3, ToppingName = "Kem Cheese", Price = 10000, IsActive = true, CreatedAt = now }
            );

            modelBuilder.Entity<Voucher>().HasData(
                new Voucher { Id = 1, Code = "HIEUVIP", DiscountAmount = 15000, ExpiryDate = now.AddDays(30), IsActive = true, CreatedAt = now },
                new Voucher { Id = 2, Code = "FREESHIP", DiscountAmount = 10000, ExpiryDate = now.AddDays(15), IsActive = true, CreatedAt = now }
            );

            modelBuilder.Entity<Banner>().HasData(
                new Banner { Id = 1, Title = "Đón Hè Cùng Trà Sữa", ImageUrl = "banner_he.jpg", LinkUrl = "/products", IsActive = true, CreatedAt = now }
            );
        }

        // ============================================================
        // 🔥 PHẦN NÂNG CẤP: TỰ ĐỘNG ĐIỀN NGÀY GIỜ VÀ LƯU LOG HỆ THỐNG
        // ============================================================
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var now = DateTime.Now;
            var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            int currentUserId = string.IsNullOrEmpty(userIdString) ? 0 : int.Parse(userIdString);

            // 1. CẬP NHẬT BaseAuditEntity 
            var auditEntities = ChangeTracker.Entries().Where(e => e.Entity is BaseAuditEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));
            foreach (var entityEntry in auditEntities)
            {
                var entity = (BaseAuditEntity)entityEntry.Entity;
                if (entityEntry.State == EntityState.Added)
                {
                    entity.CreatedAt = now;
                    entity.IsDeleted = false;
                }
                else if (entityEntry.State == EntityState.Modified)
                {
                    Entry(entity).Property(x => x.CreatedAt).IsModified = false;
                    entity.UpdatedAt = now;
                }
            }

            // 2. CHUẨN BỊ GHI LOG VÀO ActivityLog
            var jsonOptions = new JsonSerializerOptions { ReferenceHandler = ReferenceHandler.IgnoreCycles };
            var logEntries = new List<Tuple<Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry, ActivityLog>>();

            var trackedEntries = ChangeTracker.Entries()
                .Where(e => e.Entity is not ActivityLog && (e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted))
                .ToList();

            foreach (var entry in trackedEntries)
            {
                var activityLog = new ActivityLog
                {
                    EntityName = entry.Entity.GetType().Name,
                    UserId = currentUserId,
                    Timestamp = now
                };

                switch (entry.State)
                {
                    case EntityState.Added:
                        activityLog.ActionType = "CREATE";
                        activityLog.NewValues = JsonSerializer.Serialize(entry.CurrentValues.ToObject(), jsonOptions);
                        break;
                    case EntityState.Modified:
                        activityLog.ActionType = "UPDATE";
                        activityLog.OldValues = JsonSerializer.Serialize(entry.OriginalValues.ToObject(), jsonOptions);
                        activityLog.NewValues = JsonSerializer.Serialize(entry.CurrentValues.ToObject(), jsonOptions);
                        break;
                    case EntityState.Deleted:
                        activityLog.ActionType = "DELETE";
                        activityLog.OldValues = JsonSerializer.Serialize(entry.OriginalValues.ToObject(), jsonOptions);
                        break;
                }
                logEntries.Add(new Tuple<Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry, ActivityLog>(entry, activityLog));
            }

            // 3. LƯU THAY ĐỔI CHÍNH VÀO DB TRƯỚC 
            var result = await base.SaveChangesAsync(cancellationToken);

            // 4. SAU KHI CÓ ID RỒI THÌ LƯU VÀO BẢNG LOG
            if (logEntries.Any())
            {
                var logsToSave = new List<ActivityLog>();
                foreach (var item in logEntries)
                {
                    var entry = item.Item1;
                    var log = item.Item2;

                    var primaryKey = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey());
                    log.EntityId = primaryKey?.CurrentValue?.ToString() ?? "";
                    logsToSave.Add(log);
                }

                ActivityLogs.AddRange(logsToSave);
                await base.SaveChangesAsync(cancellationToken);
            }

            return result;
        }
    }
}