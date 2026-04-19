using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;
using NguyenDucHieu_2123110416.Services;
using NguyenDucHieu_2123110416.Hubs;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _config;

        public OrdersController(
            IOrderService orderService,
            AppDbContext context,
            IHubContext<NotificationHub> hubContext,
            IEmailService emailService,
            IConfiguration config)
        {
            _orderService = orderService;
            _context = context;
            _hubContext = hubContext;
            _emailService = emailService;
            _config = config;
        }

        // ====================================================================
        // 💡 HÀM TIỆN ÍCH: GỬI THÔNG BÁO (LƯU DB + BẮN SIGNALR + GỬI MAIL)
        // ====================================================================
        private async Task SendPrivateNotification(int targetUserId, string title, string message, string type, string link, string? email = null)
        {
            var notif = new Notification
            {
                UserId = targetUserId,
                Title = title,
                Message = message,
                Type = type,
                LinkUrl = link,
                IsRead = false,
                CreatedAt = DateTime.Now
            };
            _context.Notifications.Add(notif);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveNotification", new
            {
                userId = targetUserId,
                id = notif.Id,
                title = notif.Title,
                message = notif.Message,
                type = notif.Type,
                linkUrl = notif.LinkUrl,
                createdAt = notif.CreatedAt
            });

            if (!string.IsNullOrEmpty(email))
            {
                string emailBody = $"<h3>{title}</h3><p>{message}</p><hr/><p>Cảm ơn sếp đã tin dùng HieuStore!</p>";
                _ = _emailService.SendEmailAsync(email, title, emailBody);
            }
        }

        // ========================================================
        // 🚀 HÀM HỨNG KẾT QUẢ TRẢ VỀ TỪ VNPAY 
        // ========================================================
        [AllowAnonymous]
        [HttpGet("VnpayReturn")]
        public async Task<IActionResult> VnpayReturn()
        {
            var vnpayData = Request.Query;
            var vnpay = new VnPayLibrary();

            foreach (var (key, value) in vnpayData)
            {
                if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                {
                    vnpay.AddResponseData(key, value.ToString());
                }
            }

            string vnp_HashSecret = _config["Vnpay:HashSecret"] ?? "";
            string vnp_SecureHash = Request.Query["vnp_SecureHash"].FirstOrDefault() ?? "";

            bool checkSignature = false;
            if (!string.IsNullOrEmpty(vnp_SecureHash))
            {
                checkSignature = vnpay.ValidateSignature(vnp_SecureHash, vnp_HashSecret);
            }

            if (checkSignature)
            {
                string vnp_ResponseCode = vnpayData["vnp_ResponseCode"].FirstOrDefault() ?? "";
                string vnp_TxnRef = vnpayData["vnp_TxnRef"].FirstOrDefault() ?? "";

                if (int.TryParse(vnp_TxnRef.Split('_').FirstOrDefault(), out int orderId))
                {
                    var order = await _context.Orders.Include(o => o.User).FirstOrDefaultAsync(o => o.Id == orderId);

                    if (vnp_ResponseCode == "00")
                    {
                        if (order != null && order.OrderStatus != "2")
                        {
                            order.OrderStatus = "2";
                            order.UpdatedAt = DateTime.Now;
                            await _context.SaveChangesAsync();
                            await SendPrivateNotification(order.UserId, "Thanh toán thành công! 💳", $"Đơn hàng #HIEU-{orderId} đã được thanh toán qua VNPAY.", "PAYMENT_SUCCESS", "/profile", order.User?.Email);
                        }
                        // ĐÃ SỬA LINK VERCEL VỀ CHUẨN XÁC
                        return Redirect("https://chuyen-de-asp-net.vercel.app/order/success");
                    }
                }
            }
            // ĐÃ SỬA LINK VERCEL VỀ CHUẨN XÁC
            return Redirect("https://chuyen-de-asp-net.vercel.app/order/fail");
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderDetails).ThenInclude(od => od.Product)
                    .OrderByDescending(o => o.CreatedAt)
                    .Select(o => new {
                        id = o.Id,
                        customerName = o.User != null ? o.User.FullName : "Khách ẩn danh",
                        phone = o.User != null ? o.User.PhoneNumber : "",
                        totalAmount = o.FinalAmount,
                        status = o.OrderStatus,
                        createdAt = o.CreatedAt,
                        productSummary = string.Join(", ", o.OrderDetails.Select(od => od.Product.ProductName + " (x" + od.Quantity + ")"))
                    })
                    .ToListAsync();
                return Ok(orders);
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetOrderDetail(int id)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderDetails).ThenInclude(od => od.Product)
                    .Include(o => o.OrderDetails).ThenInclude(od => od.OrderDetailToppings).ThenInclude(odt => odt.Topping)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null) return NotFound("Không thấy đơn hàng!");

                var result = new
                {
                    id = order.Id,
                    customerName = order.User != null ? order.User.FullName : "Khách ẩn danh",
                    phone = order.User != null ? order.User.PhoneNumber : "",
                    address = order.OrderNote,
                    totalAmount = order.FinalAmount,
                    status = order.OrderStatus,
                    createdAt = order.CreatedAt,
                    orderDetails = order.OrderDetails.Select(od => new {
                        productName = od.Product.ProductName,
                        productId = od.ProductId,
                        size = od.Size,
                        quantity = od.Quantity,
                        unitPrice = od.UnitPrice,
                        toppingNames = string.Join(", ", od.OrderDetailToppings.Select(t => t.Topping.ToppingName))
                    })
                };
                return Ok(result);
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDTO request)
        {
            try
            {
                var adminIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(adminIdString)) return Unauthorized();

                string status = request.Status;
                await _orderService.UpdateOrderStatusAsync(id, int.Parse(status));

                var order = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderDetails).ThenInclude(od => od.Product)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order != null)
                {
                    order.UpdatedBy = int.Parse(adminIdString);
                    order.UpdatedAt = DateTime.Now;

                    if (status == "2" || order.OrderStatus.ToString() == "2")
                    {
                        int pointsEarned = (int)(order.FinalAmount / 10000);
                        if (pointsEarned > 0)
                        {
                            bool alreadyRewarded = await _context.PointTransactions.AnyAsync(pt => pt.OrderId == id && pt.Points > 0);
                            if (!alreadyRewarded)
                            {
                                _context.PointTransactions.Add(new PointTransaction
                                {
                                    UserId = order.UserId,
                                    OrderId = order.Id,
                                    Points = pointsEarned,
                                    Description = $"Tích điểm đơn hàng #HIEU-{order.Id}",
                                    CreatedAt = DateTime.Now,
                                    CreatedBy = int.Parse(adminIdString)
                                });
                            }
                        }
                    }
                    await _context.SaveChangesAsync();

                    string items = string.Join(", ", order.OrderDetails.Select(od => od.Product.ProductName + " (x" + od.Quantity + ")"));

                    string msg = status switch
                    {
                        "1" => $"Đơn hàng #HIEU-{id} [{items}] đã được quán xác nhận!",
                        "2" => $"Đơn hàng #HIEU-{id} [{items}] đã hoàn thành. Chúc sếp ngon miệng!",
                        "3" => $"Đơn hàng #HIEU-{id} [{items}] đã bị hủy.",
                        _ => $"Đơn hàng #HIEU-{id} có cập nhật mới."
                    };

                    await SendPrivateNotification(order.UserId, "Cập nhật đơn hàng 🥤", msg, "ORDER_UPDATE", "/profile", order.User?.Email);
                }
                return Ok(new { message = "Cập nhật thành công!" });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] OrderRequestDTO request)
        {
            try
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdString)) return Unauthorized(new { error = "Hết hạn đăng nhập!" });

                int currentUserId = int.Parse(userIdString);
                var orderDetails = request.Items.Select(item => new OrderDetail
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Size = item.Size,
                    OrderDetailToppings = item.ToppingIds.Select(id => new OrderDetailTopping { ToppingId = id }).ToList()
                }).ToList();

                var order = await _orderService.CreateOrderAsync(currentUserId, request.AddressId, request.VoucherCode, orderDetails, request.Note ?? string.Empty, request.ShippingFee, request.UsedPoints);

                var fullOrder = await _context.Orders
                    .Include(o => o.OrderDetails).ThenInclude(od => od.Product)
                    .Include(o => o.User)
                    .FirstOrDefaultAsync(o => o.Id == order.Id);

                if (fullOrder != null)
                {
                    string items = string.Join(", ", fullOrder.OrderDetails.Select(od => od.Product.ProductName + " (x" + od.Quantity + ")"));
                    await SendPrivateNotification(1, "🔔 CÓ ĐƠN HÀNG MỚI!", $"Khách {fullOrder.User?.FullName} vừa đặt đơn #HIEU-{order.Id}: {items}", "NEW_ORDER", "/admin/orders");
                    await SendPrivateNotification(currentUserId, "🎉 Đặt hàng thành công!", $"Đơn #HIEU-{order.Id} [{items}] đã gửi tới quán.", "CHECKOUT_SUCCESS", "/profile", fullOrder.User?.Email);
                }

                return Ok(new { message = "Đặt hàng thành công!", orderId = order.Id, finalAmount = order.FinalAmount });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetOrderHistory()
        {
            try
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
                int userId = int.Parse(userIdString);

                var orders = await _context.Orders
                    .Where(o => o.UserId == userId)
                    .OrderByDescending(o => o.CreatedAt)
                    .Select(o => new {
                        id = o.Id,
                        finalAmount = o.FinalAmount,
                        orderStatus = o.OrderStatus,
                        createdAt = o.CreatedAt,
                        updatedAt = o.UpdatedAt,
                        isReviewed = _context.Reviews.Any(r => r.OrderId == o.Id && !r.IsDeleted),
                        orderDetails = o.OrderDetails.Select(od => new {
                            productName = od.Product.ProductName,
                            productId = od.ProductId
                        }).ToList()
                    })
                    .ToListAsync();
                return Ok(orders);
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }
    }

    public class OrderRequestDTO
    {
        public int AddressId { get; set; }
        public string? VoucherCode { get; set; }
        public int UsedPoints { get; set; }
        public decimal ShippingFee { get; set; }
        public string? Note { get; set; }
        public List<OrderItemDTO> Items { get; set; } = new();
    }

    public class OrderItemDTO
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string Size { get; set; } = "M";
        public List<int> ToppingIds { get; set; } = new();
    }

    public class UpdateOrderStatusDTO
    {
        [Required] public string Status { get; set; } = null!;
    }
}