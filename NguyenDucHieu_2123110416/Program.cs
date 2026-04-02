using Microsoft.AspNetCore.Authentication.JwtBearer; // Thư viện JWT
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens; // Thư viện cấu hình Token
using Microsoft.OpenApi.Models; // <-- THÊM THƯ VIỆN NÀY ĐỂ ĐỘ CHẾ SWAGGER
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Services;
using System.Text; // Thư viện giải mã
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// 1. Đăng ký SQL Server lấy từ appsettings.json
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// ====================================================================
// 2. CẤU HÌNH BẢO MẬT JWT TOKEN (HỆ THỐNG AN NINH)
// ====================================================================
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Key"] ?? throw new Exception("Thiếu Key JWT!");
var keyBytes = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
        };
    });
builder.Services.AddAuthorization();
// ====================================================================

// 3. Thêm Controllers và cấu hình CHỐNG VÒNG LẶP VÔ TẬN (Bỏ qua Cycles)
builder.Services.AddControllers().AddJsonOptions(x =>
    x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddEndpointsApiExplorer();

// ====================================================================
// ĐỘ CHẾ SWAGGER: THÊM NÚT NHẬP TOKEN (AUTHORIZE)
// ====================================================================
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Hieu Store API", Version = "v1" });

    // Tạo form nhập Token
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập Token theo cú pháp: Bearer {Token_Của_Bạn}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    // Yêu cầu Swagger gắn Token này vào mỗi API khi gọi
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});
// ====================================================================

var app = builder.Build();

// 4. Cấu hình Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
// BẬT CÔNG TẮC BẢO VỆ Ở ĐÂY (Bắt buộc phải nằm TRÊN MapControllers)
app.UseAuthentication(); // Nhận diện xem ai đang gõ cửa (Kiểm tra thẻ)
app.UseAuthorization();  // Xem người đó có quyền vào phòng nào (Kiểm tra quyền hạn)

app.MapControllers();
app.Run();