using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Services;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ====================================================================
// 1. ĐĂNG KÝ CƠ SỞ DỮ LIỆU & SERVICES
// ====================================================================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// ====================================================================
// 2. CẤU HÌNH BẢO MẬT JWT TOKEN
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
// 3. CẤU HÌNH CONTROLLERS & JSON
// ====================================================================
builder.Services.AddControllers().AddJsonOptions(x =>
    x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddEndpointsApiExplorer();

// ====================================================================
// 4. CẤU HÌNH SWAGGER (BẬT NÚT AUTHORIZE)
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

// ====================================================================
// 5. MỞ CỬA CORS CHO FRONTEND (RẤT QUAN TRỌNG)
// ====================================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()   // Cho phép mọi tên miền (kể cả localhost:5173) gọi tới
                  .AllowAnyMethod()   // Cho phép mọi hành động (GET, POST, PUT, DELETE)
                  .AllowAnyHeader();  // Cho phép mọi loại header
        });
});

var app = builder.Build();

// ====================================================================
// 6. CẤU HÌNH MIDDLEWARE (THỨ TỰ CỰC KỲ QUAN TRỌNG)
// ====================================================================

// Đã bỏ "if (IsDevelopment)" để Swagger chạy được trên Host
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hieu Store API v1");
    // Để khi vào link mtempurl.com/swagger là thấy ngay
    c.RoutePrefix = "swagger";
});

app.UseHttpsRedirection();
app.UseStaticFiles();

// BẬT KÍCH HOẠT CORS BÊN DƯỚI (Phải nằm TRƯỚC Authentication/Authorization)
app.UseCors("AllowAll");

// BẬT CÔNG TẮC BẢO VỆ (Authentication phải nằm TRƯỚC Authorization)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();