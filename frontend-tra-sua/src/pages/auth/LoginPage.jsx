import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ========================================================
  // HÀM BÍ MẬT: GIẢI MÃ TOKEN ĐỂ BIẾT AI LÀ GIÁM ĐỐC, AI LÀ KHÁCH
  // ========================================================
  const getRoleFromToken = (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      // C# JWT thường lưu quyền ở đường link dài này hoặc key 'role'
      return decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
    } catch {
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ĐÃ SỬA LẠI THÀNH LINK LOCAL (VITE_API_URL) 🚀
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/Auth/login`, {
        email: formData.email,
        password: formData.password
      });

      // Lấy Token và lưu vào máy
      const token = response.data.token;
      localStorage.setItem('hieu_store_token', token);

      // KIỂM TRA QUYỀN HẠN TRƯỚC KHI ĐI TIẾP
      const role = getRoleFromToken(token);

      if (role === 'Admin') {
        alert("Đăng nhập thành công! Chào mừng Hiểu quay trở lại!");
        // Chuyển thẳng vào phòng Quản trị
        navigate('/admin'); 
      } else {
        alert("Đăng nhập thành công! Chào mừng bạn đến với HieuStore 🧋");
        // Khách hàng thì đẩy ra trang chủ bán hàng
        navigate('/'); 
      }

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-gray-100 relative overflow-hidden">
        {/* Trang trí góc cho xịn */}
        <div className="absolute top-0 right-0 p-8 text-6xl opacity-5 font-black italic select-none">HIEU</div>
        
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl font-black text-gray-800 tracking-tighter mb-2 italic uppercase">
            Hieu<span className="text-blue-600 underline decoration-4 underline-offset-8">Store</span> 🧋
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-4">Hệ thống đăng nhập tập trung</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-6 text-xs font-black border border-red-100 uppercase tracking-wider animate-shake">
            ⚠️ {error}
          </div>
        )}

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

        <div className="mt-10 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Chưa có thẻ nhân viên? <Link to="/register" className="text-blue-600 hover:underline font-black">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;