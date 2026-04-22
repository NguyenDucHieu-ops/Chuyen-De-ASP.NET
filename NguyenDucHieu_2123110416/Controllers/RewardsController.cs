using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NguyenDucHieu_2123110416.Data;
using NguyenDucHieu_2123110416.Models;

namespace NguyenDucHieu_2123110416.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Chỉ Admin mới được vô đây "Cơ cấu" giải thưởng
    public class RewardsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RewardsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllRewards()
        {
            var rewards = await _context.Rewards.OrderByDescending(r => r.CreatedAt).ToListAsync();
            return Ok(rewards);
        }

        [HttpPost]
        public async Task<IActionResult> CreateReward([FromBody] Reward request)
        {
            try
            {
                request.CreatedAt = DateTime.Now;
                _context.Rewards.Add(request);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Thêm phần thưởng thành công!", reward = request });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReward(int id, [FromBody] Reward request)
        {
            try
            {
                var reward = await _context.Rewards.FindAsync(id);
                if (reward == null) return NotFound(new { error = "Không tìm thấy phần thưởng" });

                reward.Name = request.Name;
                reward.Type = request.Type;
                reward.Value = request.Value;
                reward.Probability = request.Probability;
                reward.IsActive = request.IsActive;
                reward.UpdatedAt = DateTime.Now;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật thành công!" });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReward(int id)
        {
            try
            {
                var reward = await _context.Rewards.FindAsync(id);
                if (reward == null) return NotFound(new { error = "Không tìm thấy phần thưởng" });

                _context.Rewards.Remove(reward);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Đã xóa phần thưởng" });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }
    }
}