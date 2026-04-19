using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Services;
using NguyenDucHieu_2123110416.Hubs; // 💡 ĐÃ BỎ COMMENT ĐỂ NHẬN DIỆN HUB THÔNG BÁO
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ====================================================================
// 1. ĐĂNG KÝ CƠ SỞ DỮ LIỆU & SERVICES
// ====================================================================
builder.Services.AddHttpContextAccessor();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// 💡 ĐÃ BỎ COMMENT ĐỂ KHAI BÁO EMAIL SERVICE 
builder.Services.AddScoped<IEmailService, EmailService>();

// 💡 ĐĂNG KÝ SIGNALR CHO THÔNG BÁO REAL-TIME
builder.Services.AddSignalR();

// ====================================================================
// 2. MỞ CỬA CORS CHO FRONTEND (Đặt trước builder.Build)
// ====================================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowHieuStore",
        policy =>
        {
            // 💡 FIX LỖI SIGNALR: Thay vì AllowAnyOrigin() (cấm dùng chung với Credentials)
            // Sếp phải chỉ định đúng cái link Frontend React của sếp vào đây
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials(); // 💡 QUAN TRỌNG NHẤT: Cho phép SignalR gửi token qua
        });
});
// ====================================================================
// 3. CẤU HÌNH BẢO MẬT JWT TOKEN
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

builder.Services.AddControllers().AddJsonOptions(x =>
    x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddEndpointsApiExplorer();

// ====================================================================
// 4. CẤU HÌNH SWAGGER
// ====================================================================
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Hieu Store API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập Token theo cú pháp: Bearer {Token_Của_Bạn}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
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

var app = builder.Build();

// ====================================================================
// 5. CẤU HÌNH MIDDLEWARE (THỨ TỰ CỰC KỲ QUAN TRỌNG)
// ====================================================================

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hieu Store API v1");
    c.RoutePrefix = "swagger";
});

app.UseHttpsRedirection();
app.UseStaticFiles();

// 💡 DÙNG MỘT LẦN DUY NHẤT VÀ ĐẶT TRƯỚC AUTHENTICATION
app.UseCors("AllowHieuStore");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 💡 ĐÃ BỎ COMMENT ĐỂ ĐỊNH TUYẾN TỚI HUB THÔNG BÁO 
app.MapHub<NotificationHub>("/notificationHub");

app.Run();