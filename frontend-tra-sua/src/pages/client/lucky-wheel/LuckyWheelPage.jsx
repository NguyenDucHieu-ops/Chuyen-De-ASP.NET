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
  const [notifies, setNotifies] = useState([]);

  const showToast = (msg, type = 'success') => {
    const id = Date.now();
    setNotifies(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setNotifies(prev => prev.filter(n => n.id !== id)), 4000);
  };

  useEffect(() => {
    const fetchInitData = async () => {
      if (!token) return setLoading(false);
      try {
        const [profileRes, infoRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/Users/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Spin/info`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCurrentPoints(profileRes.data.currentPoints || 0);
        setSpinInfo(infoRes.data);
      } catch {
        showToast("Có lỗi khi tải dữ liệu vòng quay!", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchInitData();
  }, [token]);

  const handleSpin = async () => {
    if (isSpinning) return;
    if (currentPoints < spinInfo?.spinCost) {
      return showToast("Hết điểm rồi sếp ơi! Tích thêm điểm nha!", "error");
    }

    setIsSpinning(true);
    setRewardMessage('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/Spin/play`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const resultData = res.data;
      const numSegments = spinInfo.rewards.length;
      const segmentAngle = 360 / numSegments;
      const rewardIndex = spinInfo.rewards.findIndex(r => r.id === resultData.rewardId);
      
      if (rewardIndex === -1) throw new Error("Lỗi đồng bộ quà");

      // 💡 HIỆU ỨNG XOAY MỚI: Căn chuẩn tâm mũi tên
      const extraSpins = 360 * 6; // Quay 6 vòng
      // Chú ý: Ở hệ conic-gradient, góc 0 độ bắt đầu từ đỉnh (12h)
      const targetAngle = extraSpins - (rewardIndex * segmentAngle) - (segmentAngle / 2); 

      setRotationResult(targetAngle);

      setTimeout(() => {
        setIsSpinning(false);
        setCurrentPoints(resultData.remainingPoints);
        setRewardMessage(resultData.rewardId === 4 ? "😢 Chúc sếp may mắn lần sau nha!" : `🎉 CHÚC MỪNG: ${resultData.rewardName}!`);
        
        const channel = new BroadcastChannel('hieu_store_points');
        channel.postMessage('update_points');
        channel.close();
      }, 4500);

    } catch (err) {
      setIsSpinning(false);
      showToast(err.response?.data?.error || "Lỗi hệ thống!", "error");
    }
  };

  if (loading) return <div className="text-center p-20 font-black italic animate-pulse">ĐANG KẾT NỐI VỚI VŨ TRỤ...</div>;
  if (!token) return <div className="text-center p-20 font-black text-rose-500 uppercase italic">Vui lòng đăng nhập để quay thưởng sếp ơi!</div>;

  // Bảng màu rực rỡ
  const colors = ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93', '#FF924C'];
  const numSegments = spinInfo?.rewards.length || 4;
  const segmentAngle = 360 / numSegments;

  // 💡 TẠO CONIC GRADIENT ĐỂ CHIA MÚI TỰ ĐỘNG CHUẨN XÁC
  const generateConicGradient = () => {
    let gradientParts = [];
    let currentAngle = 0;
    
    spinInfo?.rewards.forEach((_, idx) => {
      const color = colors[idx % colors.length];
      const nextAngle = currentAngle + segmentAngle;
      gradientParts.push(`${color} ${currentAngle}deg ${nextAngle}deg`);
      currentAngle = nextAngle;
    });
    
    return `conic-gradient(${gradientParts.join(', ')})`;
  };

  return (
    <div className="min-h-[90vh] bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* TOAST NOTIFY */}
      <div className="fixed top-5 right-5 z-[500] flex flex-col gap-2">
        {notifies.map(n => (
          <div key={n.id} className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] shadow-2xl border-2 animate-slideInRight ${n.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'}`}>
            {n.msg}
          </div>
        ))}
      </div>

      <div className="text-center mb-8">
        <h1 className="text-5xl font-black text-gray-900 italic uppercase tracking-tighter">Vòng Quay <span className="text-indigo-600">Nhân Phẩm</span></h1>
        <div className="mt-4 flex flex-col items-center gap-2">
            <span className="bg-white border-2 border-gray-100 px-8 py-2 rounded-full shadow-sm font-black text-indigo-600 italic">
                SỐ DƯ: {currentPoints.toLocaleString()} ⭐
            </span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                Mỗi lượt quay tốn: {spinInfo?.spinCost} điểm
            </span>
        </div>
      </div>

      {/* 🎡 KHUNG VÒNG QUAY */}
      <div className="relative w-[340px] h-[340px] md:w-[420px] md:h-[420px] transition-all duration-500 mt-4">
        
        {/* KIM CHỈ (Màu đỏ chói) */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-rose-600 z-30 drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]"></div>
        
        {/* VÒNG TRÒN XOAY */}
        <div 
          className="w-full h-full rounded-full border-[12px] border-gray-900 overflow-hidden relative shadow-[0_10px_50px_rgba(0,0,0,0.15)]"
          style={{ 
            background: generateConicGradient(), // Sử dụng Conic Gradient
            transform: `rotate(${rotationResult}deg)`, 
            transition: 'transform 4.5s cubic-bezier(0.1, 0.7, 0.1, 1)' 
          }}
        >
          {/* Đặt chữ vào các múi */}
          {spinInfo?.rewards.map((reward, idx) => {
            // Tính toán vị trí xoay của từng dòng chữ (giữa múi)
            const textRotateAngle = (idx * segmentAngle) + (segmentAngle / 2);
            
            return (
              <div 
                key={reward.id} 
                className="absolute top-0 left-0 w-full h-full flex justify-center pt-8"
                style={{
                  transform: `rotate(${textRotateAngle}deg)`,
                  transformOrigin: '50% 50%' // Tâm xoay ở giữa
                }}
              >
                <span 
                  className="font-black text-white uppercase text-[11px] md:text-xs tracking-tighter drop-shadow-md z-10 w-24 text-center"
                  style={{
                    // Ép chữ lộn lại nếu nó nằm ở nửa dưới vòng tròn (để dễ đọc)
                    transform: textRotateAngle > 90 && textRotateAngle < 270 ? 'rotate(180deg)' : 'none'
                  }}
                >
                  {reward.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* TRỤC GIỮA (Lớn hơn, đẹp hơn) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full border-[6px] border-gray-900 z-20 flex items-center justify-center shadow-inner">
          <span className="text-3xl animate-pulse drop-shadow-md">🎁</span>
        </div>
      </div>

      <button 
        onClick={handleSpin}
        disabled={isSpinning || currentPoints < spinInfo?.spinCost}
        className={`mt-12 px-16 py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-90 ${
          isSpinning || currentPoints < spinInfo?.spinCost
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/40'
        }`}
      >
        {isSpinning ? '🎡 Vận may đang tới...' : '🚀 QUAY NGAY'}
      </button>

      {/* HIỆN KẾT QUẢ SAU KHI QUAY XONG */}
      {rewardMessage && (
        <div className="mt-8 p-6 bg-white border-4 border-indigo-50 rounded-[2.5rem] shadow-xl max-w-sm text-center animate-scaleIn">
          <p className="font-black text-gray-800 text-sm italic uppercase leading-relaxed whitespace-pre-line">{rewardMessage}</p>
        </div>
      )}
    </div>
  );
};

export default LuckyWheelPage;