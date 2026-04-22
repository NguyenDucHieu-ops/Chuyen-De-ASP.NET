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
      } catch  {
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

      // 💡 HIỆU ỨNG XOAY: Quay 5 vòng + lùi lại đúng vị trí múi quà
      // Kim chỉ ở đỉnh (12 giờ), nên ta trừ đi góc của món quà
      const extraSpins = 360 * 8; 
      const targetAngle = extraSpins - (rewardIndex * segmentAngle) - (segmentAngle / 2); 

      setRotationResult(targetAngle);

      setTimeout(() => {
        setIsSpinning(false);
        setCurrentPoints(resultData.remainingPoints);
        setRewardMessage(resultData.rewardId === 4 ? "😢 Chúc sếp may mắn lần sau nha!" : `🎉 CHÚC MỪNG: ${resultData.rewardName}!`);
        
        const channel = new BroadcastChannel('hieu_store_points');
        channel.postMessage('update_points');
        channel.close();
      }, 4000);

    } catch (err) {
      setIsSpinning(false);
      showToast(err.response?.data?.error || "Lỗi hệ thống!", "error");
    }
  };

  if (loading) return <div className="text-center p-20 font-black italic animate-pulse">ĐANG KẾT NỐI VỚI VŨ TRỤ...</div>;
  if (!token) return <div className="text-center p-20 font-black text-rose-500 uppercase italic">Vui lòng đăng nhập để quay thưởng sếp ơi!</div>;

  const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];
  const numSegments = spinInfo?.rewards.length || 4;
  const segmentAngle = 360 / numSegments;

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
      <div className="relative w-[340px] h-[340px] md:w-[400px] md:h-[400px] transition-all duration-500">
        
        {/* KIM CHỈ (Màu đỏ cho nổi) */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[35px] border-l-transparent border-r-transparent border-t-rose-600 z-30 drop-shadow-lg"></div>
        
        {/* VÒNG TRÒN XOAY */}
        <div 
          className="w-full h-full rounded-full border-[10px] border-gray-900 overflow-hidden relative shadow-[0_0_80px_rgba(79,70,229,0.2)] bg-gray-900"
          style={{ 
            transform: `rotate(${rotationResult}deg)`, 
            transition: 'transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)' 
          }}
        >
          {spinInfo?.rewards.map((reward, idx) => (
            <div 
              key={reward.id} 
              className="absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left"
              style={{
                backgroundColor: colors[idx % colors.length],
                // 💡 Tăng scale lên 1.1 để xóa các khe hở trắng giữa các múi
                transform: `rotate(${idx * segmentAngle}deg) skewY(${90 - segmentAngle}deg) scale(1.1)`
              }}
            >
              <div 
                className="absolute bottom-0 left-0 w-[200px] text-center font-black text-white uppercase text-[9px] md:text-[10px] tracking-tighter leading-tight"
                style={{
                  // 💡 Đẩy chữ ra xa tâm hơn để không bị thu nhỏ
                  transform: `skewY(-${90 - segmentAngle}deg) rotate(${segmentAngle / 2}deg) translate(40px, -70px)`,
                  width: '160px'
                }}
              >
                {reward.name}
              </div>
            </div>
          ))}
        </div>

        {/* TRỤC GIỮA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-900 z-20 flex items-center justify-center shadow-2xl">
          <span className="text-2xl animate-pulse">🎁</span>
        </div>
      </div>

      <button 
        onClick={handleSpin}
        disabled={isSpinning || currentPoints < spinInfo?.spinCost}
        className={`mt-10 px-16 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-90 ${
          isSpinning || currentPoints < spinInfo?.spinCost
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/40'
        }`}
      >
        {isSpinning ? '🎡 Vận may đang tới...' : '🚀 QUAY NGAY'}
      </button>

      {rewardMessage && (
        <div className="mt-8 p-6 bg-white border-4 border-indigo-50 rounded-[2.5rem] shadow-xl max-w-xs text-center animate-scaleIn">
          <p className="font-black text-gray-800 text-sm italic uppercase leading-relaxed">{rewardMessage}</p>
        </div>
      )}
    </div>
  );
};

export default LuckyWheelPage;