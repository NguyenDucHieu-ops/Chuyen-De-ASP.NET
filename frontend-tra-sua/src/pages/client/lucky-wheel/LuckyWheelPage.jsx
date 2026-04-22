import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 🔊 LOAD SOUND (Sếp giữ nguyên cái này rất hay)
const spinSound = new Audio("https://www.soundjay.com/misc/sounds/spin-1.mp3");
const winSound = new Audio("https://www.soundjay.com/human/sounds/applause-8.mp3");

const LuckyWheelPage = () => {
  const token = localStorage.getItem('hieu_store_token');
  const [loading, setLoading] = useState(true);
  const [spinInfo, setSpinInfo] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationResult, setRotationResult] = useState(0);
  const [rewardMessage, setRewardMessage] = useState('');
  const [notifies, setNotifies] = useState([]);
  
  // State hiệu ứng của sếp
  const [winnerIndex, setWinnerIndex] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

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

    // Reset state trước khi quay
    setIsSpinning(true);
    setRewardMessage('');
    setWinnerIndex(null);
    setShowConfetti(false);

    // Bật nhạc quay
    spinSound.currentTime = 0;
    spinSound.play();

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/Spin/play`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const resultData = res.data;
      const numSegments = spinInfo.rewards.length;
      const segmentAngle = 360 / numSegments;
      const rewardIndex = spinInfo.rewards.findIndex(r => r.id === resultData.rewardId);
      
      if (rewardIndex === -1) throw new Error("Lỗi đồng bộ quà");

      const extraSpins = 360 * 8; 
      const targetAngle = extraSpins - (rewardIndex * segmentAngle) - (segmentAngle / 2); 

      setRotationResult(targetAngle);

      // Đợi vòng quay dừng lại (4.5s)
      setTimeout(() => {
        setIsSpinning(false);
        setCurrentPoints(resultData.remainingPoints);
        
        // Đổi nhạc
        spinSound.pause();
        winSound.currentTime = 0;
        winSound.play();

        // Bật pháo giấy & highlight
        setWinnerIndex(rewardIndex);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000); // Tắt pháo sau 5s

        setRewardMessage(resultData.rewardId === 4 ? "😢 OOPS! Chúc sếp may mắn lần sau nha!" : `🎉 CHÚC MỪNG SẾP NHẬN ĐƯỢC:\n ${resultData.rewardName}!`);
        
        const channel = new BroadcastChannel('hieu_store_points');
        channel.postMessage('update_points');
        channel.close();
      }, 4500);

    } catch (err) {
      setIsSpinning(false);
      spinSound.pause();
      showToast(err.response?.data?.error || "Lỗi hệ thống!", "error");
    }
  };

  if (loading) return <div className="text-center p-20 font-black italic animate-pulse">ĐANG KẾT NỐI VỚI VŨ TRỤ...</div>;
  if (!token) return <div className="text-center p-20 font-black text-rose-500 uppercase italic">Vui lòng đăng nhập để quay thưởng sếp ơi!</div>;

  const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const numSegments = spinInfo?.rewards.length || 4;
  const segmentAngle = 360 / numSegments;

  // 💡 CÔNG THỨC CHIA MÚI SIÊU CHUẨN (KHÔNG DÙNG SKEWY)
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
    // Đổi sang nền tối (Dark mode) cho nó ngầu giống hình sếp gửi
    <div className="min-h-[90vh] bg-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* 🎆 HIỆU ỨNG PHÁO GIẤY */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[100] animate-confetti flex justify-around">
          <span className="text-6xl">🎉</span>
          <span className="text-6xl mt-10">🎊</span>
          <span className="text-6xl">🎉</span>
          <span className="text-6xl mt-20">🎊</span>
          <span className="text-6xl">🎉</span>
        </div>
      )}

      {/* TOAST NOTIFY */}
      <div className="fixed top-5 right-5 z-[500] flex flex-col gap-2">
        {notifies.map(n => (
          <div key={n.id} className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] shadow-2xl border-2 animate-slideInRight ${n.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'}`}>
            {n.msg}
          </div>
        ))}
      </div>

      <div className="text-center mb-8 z-10">
        <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">Vòng Quay <span className="text-yellow-400">Nhân Phẩm</span></h1>
        <div className="mt-4 flex flex-col items-center gap-2">
            <span className="bg-gray-800 border-2 border-gray-700 px-8 py-2 rounded-full shadow-sm font-black text-yellow-400 italic">
                SỐ DƯ: {currentPoints.toLocaleString()} ⭐
            </span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                Mỗi lượt quay tốn: {spinInfo?.spinCost} điểm
            </span>
        </div>
      </div>

      {/* 🎡 KHUNG VÒNG QUAY */}
      <div className="relative w-[340px] h-[340px] md:w-[420px] md:h-[420px] mt-4 z-10">
        
        {/* KIM CHỈ (Màu đỏ chói) */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[18px] border-r-[18px] border-t-[40px] border-l-transparent border-r-transparent border-t-rose-600 z-40 drop-shadow-md"></div>
        
        {/* VÒNG TRÒN XOAY */}
        <div 
          className={`w-full h-full rounded-full border-[12px] overflow-hidden relative transition-all duration-[4.5s] ease-[cubic-bezier(0.1,0.7,0.1,1)] ${winnerIndex !== null ? 'border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.5)]' : 'border-gray-800 shadow-[0_10px_50px_rgba(0,0,0,0.5)]'}`}
          style={{ 
            background: generateConicGradient(), 
            transform: `rotate(${rotationResult}deg)` 
          }}
        >
          {/* CẮM CHỮ */}
          {spinInfo?.rewards.map((reward, idx) => {
            const angle = (idx * segmentAngle) + (segmentAngle / 2);
            const isWinner = winnerIndex === idx;
            
            return (
              <div 
                key={reward.id} 
                className="absolute top-1/2 left-1/2 flex items-center pr-4 md:pr-6"
                style={{
                  width: '50%', 
                  height: '40px', 
                  transformOrigin: '0% 50%', 
                  transform: `translate(0, -50%) rotate(${angle - 90}deg)`,
                  zIndex: 10
                }}
              >
                <span 
                  className={`font-black uppercase text-[9px] md:text-[11px] tracking-wider leading-tight line-clamp-2 transition-all duration-500 ${isWinner ? 'text-yellow-300 scale-125 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'}`}
                  style={{ 
                    transform: angle > 180 ? 'rotate(180deg)' : 'none',
                    display: 'block',
                    textAlign: angle > 180 ? 'left' : 'right', 
                    width: '100%' 
                  }}
                >
                  {reward.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* TRỤC GIỮA */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-[6px] z-20 flex items-center justify-center transition-all duration-500 ${winnerIndex !== null ? 'bg-yellow-400 border-white scale-110 shadow-[0_0_30px_gold]' : 'bg-gray-800 border-gray-900 shadow-inner'}`}>
          <span className="text-3xl drop-shadow-md">🎁</span>
        </div>
      </div>

      <button 
        onClick={handleSpin}
        disabled={isSpinning || currentPoints < spinInfo?.spinCost}
        className={`mt-12 px-16 py-6 z-10 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-90 ${
          isSpinning || currentPoints < spinInfo?.spinCost
          ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
          : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/40'
        }`}
      >
        {isSpinning ? '🎡 Đang xoay...' : '🚀 QUAY NGAY'}
      </button>

      {/* HIỆN KẾT QUẢ SAU KHI QUAY XONG */}
      {rewardMessage && (
        <div className="mt-8 z-10 p-6 bg-gray-800 border-2 border-yellow-400/50 rounded-[2.5rem] shadow-[0_0_30px_rgba(250,204,21,0.1)] max-w-sm text-center animate-scaleIn">
          <p className="font-black text-yellow-400 text-sm uppercase leading-relaxed whitespace-pre-line">{rewardMessage}</p>
        </div>
      )}

      {/* 🎮 ANIMATION PHÁO GIẤY */}
      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LuckyWheelPage;