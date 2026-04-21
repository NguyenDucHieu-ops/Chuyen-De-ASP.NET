using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Services;
using NguyenDucHieu_2123110416.Hubs;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// 1. ĐĂNG KÝ CƠ SỞ DỮ LIỆU & SERVICES
builder.Services.AddHttpContextAccessor();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddSignalR();

// 2. MỞ CỬA CORS (ĐÃ FIX LỖI SIGNALR)
builder.Services.AddCors(options => {
    options.AddPolicy("AllowHieuStore", policy => {
        policy
            // PHẢI CHỈ ĐỊNH ĐÚNG LINK VERCEL VÀ LOCALHOST, KHÔNG ĐƯỢC DÙNG DẤU * (AllowAnyOrigin) NỮA
            .WithOrigins("https://chuyen-de-asp-net.vercel.app", "http://localhost:5173", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // BẮT BUỘC PHẢI CÓ ĐỂ TRUYỀN TOKEN CHO SIGNALR
    });
});

// 3. JWT AUTHENTICATION
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Key"] ?? "ChuoiBiMatMacDinhCuaHieu123456789";
var keyBytes = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
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

// 4. CẤU HÌNH SWAGGER (FIX LỖI 500 RENDER)
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Hieu Store API", Version = "v1" });

    // ĐÃ BỎ dòng c.MapType<IFormFile> cũ - Nguyên nhân gây lỗi 500 trên server

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập Token theo định dạng: Bearer {your_token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        {
            new OpenApiSecurityScheme {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// 5. MIDDLEWARE
// Chú ý: app.UseSwagger() phải nằm ngoài IF để Render hiện được bảng API
app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hieu Store API v1");
    c.RoutePrefix = "swagger"; // Truy cập link: ...onrender.com/swagger
});

app.UseStaticFiles();

// QUAN TRỌNG: UseCors phải nằm TRƯỚC Authentication/Authorization
app.UseCors("AllowHieuStore");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/notificationHub");

app.Run();