using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;
using System.Security.Claims;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bắt buộc phải đăng nhập mới được quay
    public class SpinController : ControllerBase
    {
        private readonly AppDbContext _context;
        private const int SPIN_COST = 50; // Mỗi lần quay tốn 200 điểm

        public SpinController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("info")]
        public async Task<IActionResult> GetSpinInfo()
        {
            var rewards = await _context.Rewards.Where(r => r.IsActive).OrderBy(r => r.Id).ToListAsync();
            return Ok(new
            {
                spinCost = SPIN_COST,
                rewards = rewards.Select(r => new { id = r.Id, name = r.Name })
            });
        }

        [HttpPost("play")]
        public async Task<IActionResult> Play()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users.FindAsync(userId);

            if (user == null) return Unauthorized();
            if (user.LoyaltyPoints < SPIN_COST) return BadRequest(new { error = "Sếp không đủ điểm để quay rồi, mua thêm trà sữa tích điểm nha!" });

            // 1. Trừ điểm
            user.LoyaltyPoints -= SPIN_COST;

            // 2. Quay xổ số (Dựa trên Probability)
            var rewards = await _context.Rewards.Where(r => r.IsActive).ToListAsync();
            double roll = new Random().NextDouble(); // Sinh số ngẫu nhiên từ 0.0 -> 1.0
            double cumulative = 0.0;
            Reward? wonReward = null;

            foreach (var r in rewards)
            {
                cumulative += r.Probability;
                if (roll <= cumulative)
                {
                    wonReward = r;
                    break;
                }
            }

            // Dự phòng nếu lỗi làm tròn số
            if (wonReward == null) wonReward = rewards.Last();

            // 3. Trao quà
            string extraMessage = "";
            if (wonReward.Type == "POINTS")
            {
                user.LoyaltyPoints += wonReward.Value;
                extraMessage = $"Đã cộng thêm {wonReward.Value} điểm vào tài khoản.";
            }
            else if (wonReward.Type == "VOUCHER")
            {
                // Tự sinh mã voucher random cho khách xài
                string newCode = "LUCK" + new Random().Next(1000, 9999).ToString();
                var voucher = new Voucher
                {
                    Code = newCode,
                    DiscountAmount = wonReward.Value,
                    ExpiryDate = DateTime.Now.AddDays(7), // Hạn xài 7 ngày
                    IsActive = true
                };
                _context.Vouchers.Add(voucher);
                extraMessage = $"Mã Voucher của sếp là: {newCode}. Hạn xài 7 ngày nha!";
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                rewardId = wonReward.Id,
                rewardName = wonReward.Name,
                message = extraMessage,
                remainingPoints = user.LoyaltyPoints
            });
        }
    }
}