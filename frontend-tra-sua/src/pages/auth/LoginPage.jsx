import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🚀 HỆ THỐNG TOAST THÔNG BÁO XỊN
  const [notifies, setNotifies] = useState([]);
  const showToast = (msg, type = 'success') => {
    const id = Date.now();
    setNotifies(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifies(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const getRoleFromToken = (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
    } catch {
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/Auth/login`, {
        email: formData.email,
        password: formData.password
      });

      const token = response.data.token;
      localStorage.setItem('hieu_store_token', token);

      const role = getRoleFromToken(token);

      showToast("Đăng nhập thành công!", "success");
      
      // Đợi Toast hiện xong rồi mới chuyển trang
      setTimeout(() => {
        if (role === 'Admin') {
          navigate('/admin'); 
        } else {
          navigate('/'); 
        }
      }, 1500);

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        showToast(err.response.data.error, "error");
      } else {
        showToast("Tài khoản hoặc mật khẩu không chính xác!", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans relative">
      
      {/* 🚀 TOAST UI */}
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
        <div className="absolute top-0 right-0 p-8 text-6xl opacity-5 font-black italic select-none">HIEU</div>
        
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl font-black text-gray-800 tracking-tighter mb-2 italic uppercase">
            Hieu<span className="text-blue-600 underline decoration-4 underline-offset-8">Store</span> 🧋
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-4">Hệ thống đăng nhập tập trung</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Email Account</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-[1.8rem] outline-none transition-all font-bold text-gray-800"
              placeholder="admin@hieustore.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Security Password</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-[1.8rem] outline-none transition-all font-bold text-gray-800"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full py-5 rounded-[2rem] text-white font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl mt-6 active:scale-95 ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
            }`}
          >
            {loading ? 'Đang xác thực...' : 'Truy cập hệ thống'}
          </button>
        </form>

        <div className="mt-10 text-center space-y-4 text-[10px] font-black text-gray-400 uppercase tracking-widest relative z-10">
          <p>
            Chưa có thẻ nhân viên? <Link to="/register" className="text-blue-600 hover:underline font-black">Đăng ký ngay</Link>
          </p>
          {/* NÚT QUÊN MẬT KHẨU (Dành cho sau này) */}
          <p>
            <button className="text-gray-500 hover:text-rose-500 hover:underline transition-colors">Trí nhớ kém? Quên mật khẩu</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;