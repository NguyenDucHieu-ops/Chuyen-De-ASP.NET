import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LuckyWheelPage = () => {
  const token = localStorage.getItem('hieu_store_token');
  const [loading, setLoading] = useState(true);
  const [spinInfo, setSpinInfo] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationResult, setRotationResult] = useState(0);
  const [rewardMessage, setRewardMessage] = useState('');

  // 🚀 TOAST UI
  const [notifies, setNotifies] = useState([]);
  const showToast = (msg, type = 'success') => {
    const id = Date.now();
    setNotifies(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setNotifies(prev => prev.filter(n => n.id !== id)), 4000);
  };

  useEffect(() => {
    const fetchInitData = async () => {
      if (!token) {
        showToast("Sếp phải đăng nhập mới được quay nha!", "error");
        setLoading(false);
        return;
      }
      try {
        const [profileRes, infoRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/Users/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Spin/info`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCurrentPoints(profileRes.data.currentPoints || 0);
        setSpinInfo(infoRes.data);
      } catch (err) {
        console.error("Lỗi tải data vòng quay:", err);
        showToast("Có lỗi xảy ra khi kết nối hệ thống!", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchInitData();
  }, [token]);

  const handleSpin = async () => {
    if (isSpinning) return;
    if (currentPoints < spinInfo?.spinCost) {
      return showToast("Hết điểm rồi sếp ơi, mua thêm trà sữa để tích điểm nha!", "error");
    }

    setIsSpinning(true);
    setRewardMessage('');

    try {
      // Gọi API lên server xin quay
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/Spin/play`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const resultData = res.data; // { rewardId, rewardName, message, remainingPoints }
      
      // TÍNH TOÁN GÓC QUAY (Hiệu ứng)
      // Mặc định vòng quay có 4 phần thưởng, mỗi phần chiếm 90 độ (360/4)
      const numSegments = spinInfo.rewards.length;
      const segmentAngle = 360 / numSegments;
      
      // Tìm vị trí của phần thưởng trúng trong mảng
      const rewardIndex = spinInfo.rewards.findIndex(r => r.id === resultData.rewardId);
      
if (rewardIndex === -1) throw new Error("Lỗi đồng bộ quà tặng");
      // Quay thêm 5 vòng (5 * 360 = 1800 độ) cho kịch tính, cộng thêm góc để kim chỉ vào đúng múi
      // Dấu trừ vì kim quay ở trên cùng, múi đầu tiên ở góc 0 độ
      const extraSpins = 360 * 5; 
      const targetAngle = extraSpins - (rewardIndex * segmentAngle) - (segmentAngle / 2); 

      setRotationResult(targetAngle);

      // Đợi hiệu ứng quay kết thúc (ví dụ 4 giây) rồi mới hiện kết quả
      setTimeout(() => {
        setIsSpinning(false);
        setCurrentPoints(resultData.remainingPoints);
        
        let msg = `🎉 CHÚC MỪNG SẾP TRÚNG: ${resultData.rewardName}!\n${resultData.message}`;
        if (resultData.rewardId === 4) { // ID 4 là trượt
             msg = "😢 OOPS! Chúc sếp may mắn lần sau nha!";
        }
        
        setRewardMessage(msg);
        
        // Báo cho Navbar cập nhật điểm luôn nếu cần thiết
        const channel = new BroadcastChannel('hieu_store_points');
        channel.postMessage('update_points');
        channel.close();

      }, 4000); // Khớp với transition duration của CSS

    } catch (err) {
      setIsSpinning(false);
      showToast(err.response?.data?.error || "Lỗi hệ thống không quay được!", "error");
    }
  };

  if (loading) return <div className="text-center p-20 font-black">Đang tải cấu hình vòng quay...</div>;
  if (!token) return <div className="text-center p-20 font-black text-rose-500">Đăng nhập để thử vận may sếp nhé!</div>;

  // Lên màu sắc cho từng múi (Giả sử có 4 múi)
  const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];
  const segmentAngle = spinInfo ? 360 / spinInfo.rewards.length : 90;

  return (
    <div className="min-h-[80vh] bg-gray-50 flex flex-col items-center justify-center p-6 relative">
      
      {/* KHU VỰC TOAST */}
      <div className="fixed top-10 right-10 z-[300] flex flex-col gap-2">
        {notifies.map(n => (
          <div key={n.id} className={`px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] shadow-2xl animate-slideInRight tracking-widest border-2 flex items-center gap-3 ${
            n.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
          }`}>
            {n.type === 'success' ? '✅' : '❌'} {n.msg}
          </div>
        ))}
      </div>

      <div className="text-center mb-10">
        <h1 className="text-5xl font-black text-gray-900 italic uppercase tracking-tighter">Vòng Quay <span className="text-indigo-600">Nhân Phẩm</span></h1>
        <p className="mt-4 font-bold text-gray-500 bg-white px-6 py-2 rounded-full shadow-sm inline-block border-2 border-gray-100">
           Điểm hiện tại: <span className="text-indigo-600 font-black">{currentPoints} ⭐</span>
        </p>
        <p className="text-xs font-black text-gray-400 mt-2 uppercase tracking-widest">({spinInfo?.spinCost} điểm / 1 lần quay)</p>
      </div>

      {/* KHU VỰC VÒNG QUAY BẰNG CSS THUẦN */}
      <div className="relative w-80 h-80 mb-10">
        {/* Mũi tên chỉ (Kim quay) */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-gray-900 z-10 filter drop-shadow-md"></div>
        
        {/* Cái vòng xoay */}
        <div 
           className="w-full h-full rounded-full border-8 border-gray-900 overflow-hidden relative shadow-[0_0_50px_rgba(79,70,229,0.3)]"
           style={{ 
             transform: `rotate(${rotationResult}deg)`, 
             transition: 'transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)' // Hiệu ứng xoay mượt mà, chậm dần về cuối
           }}
        >
          {spinInfo?.rewards.map((reward, idx) => (
             <div 
               key={reward.id} 
               className="absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left flex items-center justify-center p-4"
               style={{
                 backgroundColor: colors[idx % colors.length],
                 transform: `rotate(${idx * segmentAngle}deg) skewY(${90 - segmentAngle}deg)`
               }}
             >
                <div 
                  className="font-black text-white uppercase text-xs text-center drop-shadow-md"
                  style={{
                    transform: `skewY(-${90 - segmentAngle}deg) rotate(${segmentAngle / 2}deg) translateY(-40px)`
                  }}
                >
                  {reward.name}
                </div>
             </div>
          ))}
        </div>

        {/* Nút ở giữa vòng quay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-900 z-10 flex items-center justify-center shadow-inner">
           <span className="text-2xl">⭐</span>
        </div>
      </div>

      <button 
         onClick={handleSpin}
         disabled={isSpinning || currentPoints < spinInfo?.spinCost}
         className={`px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
           isSpinning || currentPoints < spinInfo?.spinCost
           ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
           : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/50'
         }`}
      >
         {isSpinning ? 'Đang quay...' : 'Thử Vận May'}
      </button>

      {/* HIỆN KẾT QUẢ SAU KHI QUAY XONG */}
      {rewardMessage && (
        <div className="mt-10 p-6 bg-white border-2 border-indigo-100 rounded-3xl shadow-lg max-w-md text-center animate-scaleIn">
           <p className="font-black text-gray-800 whitespace-pre-line">{rewardMessage}</p>
        </div>
      )}
    </div>
  );
};

export default LuckyWheelPage;