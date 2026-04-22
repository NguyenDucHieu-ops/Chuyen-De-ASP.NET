import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 🔊 LOAD SOUND
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
  const [, setNotifies] = useState([]);
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
        showToast("Lỗi tải dữ liệu!", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchInitData();
  }, [token]);

  const handleSpin = async () => {
    if (isSpinning) return;

    if (currentPoints < spinInfo?.spinCost) {
      return showToast("Không đủ điểm!", "error");
    }

    setIsSpinning(true);
    setRewardMessage('');
    setWinnerIndex(null);
    setShowConfetti(false);

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
      if (rewardIndex === -1) throw new Error();

      const extraSpins = 360 * 6;
      const targetAngle = extraSpins - (rewardIndex * segmentAngle) - (segmentAngle / 2);

      setRotationResult(targetAngle);

      setTimeout(() => {
        spinSound.pause();
        winSound.currentTime = 0;
        winSound.play();

        setWinnerIndex(rewardIndex);
        setShowConfetti(true);

        setTimeout(() => setShowConfetti(false), 3000);

        setIsSpinning(false);
        setCurrentPoints(resultData.remainingPoints);
        setRewardMessage(`🎉 ${resultData.rewardName}`);

      }, 4500);

    } catch {
      setIsSpinning(false);
      showToast("Lỗi hệ thống!", "error");
    }
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!token) return <div className="p-20 text-center text-red-500">Login đi bro</div>;

  const colors = ['#FF595E','#FFCA3A','#8AC926','#1982C4','#6A4C93','#FF924C'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-gray-100">

      {/* 🎆 CONFETTI */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 animate-confetti">
          🎉 🎊 🎉 🎊 🎉 🎊
        </div>
      )}

      {/* 🎡 WHEEL */}
      <div className="relative w-[360px] h-[360px]">

        {/* POINTER */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 
          border-l-[20px] border-r-[20px] border-t-[40px] 
          border-transparent border-t-red-500 z-50"></div>

        <div
          className="w-full h-full rounded-full overflow-hidden border-[8px] border-white shadow-xl"
          style={{
            transform: `rotate(${rotationResult}deg)`,
            transition: 'transform 4.5s cubic-bezier(0.1,0.7,0.1,1)'
          }}
        >

          {spinInfo.rewards.map((reward, idx) => {
            const angle = 360 / spinInfo.rewards.length;
            const isWinner = winnerIndex === idx;

            return (
              <div
                key={reward.id}
                className={`absolute top-0 left-1/2 origin-bottom ${isWinner ? 'animate-pulse scale-110 z-40' : ''}`}
                style={{
                  width: '50%',
                  height: '50%',
                  transform: `rotate(${idx * angle}deg) skewY(${90 - angle}deg)`,
                  background: colors[idx % colors.length],
                  boxShadow: isWinner ? '0 0 20px gold' : 'none'
                }}
              >
                <div
                  className="absolute left-[-100%] top-[35%] w-[200%] text-center"
                  style={{
                    transform: `skewY(-${90 - angle}deg) rotate(${angle / 2}deg)`
                  }}
                >
                  <span className="text-white font-bold text-xs">
                    {reward.name}
                  </span>
                </div>
              </div>
            );
          })}

        </div>

        {/* CENTER */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-20 h-20 bg-white rounded-full flex items-center justify-center z-40">
          🎁
        </div>
      </div>

      <button
        onClick={handleSpin}
        className="mt-8 px-10 py-4 bg-indigo-600 text-white rounded-full font-bold active:scale-90"
      >
        {isSpinning ? "Đang quay..." : "QUAY NGAY"}
      </button>

      {rewardMessage && (
        <div className="mt-6 text-xl font-bold">
          {rewardMessage}
        </div>
      )}

      {/* 🎮 ANIMATION */}
      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .animate-confetti {
          animation: confetti 2s linear infinite;
          font-size:40px;
          text-align:center;
        }
      `}</style>

    </div>
  );
};

export default LuckyWheelPage;