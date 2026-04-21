import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // 🚀 TOAST UI
  const [notifies, setNotifies] = useState([]);
  const showToast = (msg, type = 'success') => {
    const id = Date.now();
    setNotifies(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setNotifies(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email) return showToast("Vui lòng nhập Email!", "error");
    
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/Auth/forgot-password`, { email });
      showToast(response.data.message || "Đã gửi link khôi phục! Sếp check mail nhé.", "success");
      setEmail(''); // Xóa trắng ô nhập sau khi gửi thành công
    } catch (err) {
      showToast(err.response?.data?.error || "Lỗi hệ thống, không gửi được mail!", "error");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase italic">
            Quên Mật Khẩu?
          </h1>
          <p className="text-xs font-bold text-gray-400 mt-3 leading-relaxed">
            Đừng lo! Nhập Email của sếp vào đây, tui sẽ gửi chìa khóa vạn năng để mở lại tài khoản.
          </p>
        </div>

        <form onSubmit={handleForgot} className="space-y-6 relative z-10">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Email Đã Đăng Ký</label>
            <input 
              type="email" required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-[1.8rem] outline-none transition-all font-bold text-gray-800"
              placeholder="sếp_nhập_email_vào_đây@gmail.com"
            />
          </div>
          
          <button 
            type="submit" disabled={loading} 
            className={`w-full py-5 rounded-[2rem] text-white font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
              loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
            }`}
          >
            {loading ? 'Đang gửi bồ câu đưa thư...' : 'Gửi Link Khôi Phục'}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest relative z-10">
          <Link to="/login" className="text-indigo-600 hover:underline hover:text-indigo-800 transition-colors">← Quay Lại Đăng Nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;