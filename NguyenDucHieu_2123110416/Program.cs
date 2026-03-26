using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Đăng ký SQL Server lấy từ appsettings.json
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Thêm Controllers và Swagger kèm cấu hình bỏ qua Validate Navigation Properties
builder.Services.AddControllers(options =>
{
    // Tắt tính năng tự động bắt lỗi các object liên kết (như Category trong Product)
    options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 3. Cấu hình Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();
app.Run();