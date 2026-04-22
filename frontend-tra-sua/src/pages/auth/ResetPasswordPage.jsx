import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Lấy Email và Token từ URL
  const emailParam = searchParams.get('email');
  const tokenParam = searchParams.get('token');

  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  // 🚀 TOAST UI
  const [notifies, setNotifies] = useState([]);
  const showToast = (msg, type = 'success') => {
    const id = Date.now();
    setNotifies(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setNotifies(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!emailParam || !tokenParam) {
      return showToast("Đường dẫn không hợp lệ hoặc đã bị hỏng!", "error");
    }

    if (formData.newPassword.length < 6) {
      return showToast("Mật khẩu phải dài ít nhất 6 ký tự sếp ơi!", "error");
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return showToast("Mật khẩu nhập lại không khớp!", "error");
    }

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/Auth/reset-password`, {
        email: emailParam,
        token: tokenParam,
        newPassword: formData.newPassword
      });

      showToast(response.data.message || "Đổi mật khẩu thành công! Tuyệt vời!", "success");
      
      // Đợi 2s rồi đẩy về trang đăng nhập
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      showToast(err.response?.data?.error || "Mã xác nhận đã hết hạn hoặc không đúng!", "error");
    } finally {
      setLoading(false);
    }
  };

  // Nếu không có Token thì chặn lại
  if (!emailParam || !tokenParam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center border-4 border-rose-100">
           <div className="text-6xl mb-4">⛔</div>
           <h1 className="text-2xl font-black text-gray-800 uppercase italic">Truy cập không hợp lệ</h1>
           <p className="text-sm font-bold text-gray-500 mt-2 mb-6">Sếp vui lòng click vào link ở trong Email nhé!</p>
           <Link to="/login" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black uppercase text-xs hover:bg-gray-700">Về Đăng Nhập</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      
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

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-gray-100 relative overflow-hidden">
        <div className="text-center mb-8 relative z-10">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase italic">
            Tạo Pass Mới
          </h1>
          <p className="text-xs font-bold text-emerald-600 mt-3 bg-emerald-50 py-2 rounded-xl border border-emerald-100">
            Tài khoản: {emailParam}
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-6 relative z-10">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Mật Khẩu Mới</label>
            <input 
              type="password" required minLength="6"
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-[1.8rem] outline-none transition-all font-bold text-gray-800"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Nhập Lại Mật Khẩu</label>
            <input 
              type="password" required minLength="6"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-[1.8rem] outline-none transition-all font-bold text-gray-800"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-3 mt-8">
            <button 
              type="submit" disabled={loading} 
              className={`w-full py-5 rounded-[2rem] text-white font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
                loading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
              }`}
            >
              {loading ? 'Đang đổi mật khẩu...' : 'Xác Nhận Đổi'}
            </button>

            {/* 💡 NÚT QUAY LẠI MỚI THÊM VÀO ĐÂY */}
            <button 
              type="button" 
              onClick={() => navigate(-1)} // Hàm navigate(-1) giúp quay lại trang trước đó (thường là Profile)
              disabled={loading}
              className="w-full py-4 rounded-[2rem] text-gray-500 bg-gray-100 hover:bg-gray-200 font-black text-xs uppercase tracking-[0.1em] transition-all active:scale-95"
            >
              Quay lại 
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;