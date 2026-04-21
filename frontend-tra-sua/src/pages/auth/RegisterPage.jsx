import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/Auth/register`, formData);
      
      showToast(response.data.message || "Đăng ký thành công! Hãy đăng nhập nhé.", "success");
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        showToast(err.response.data.error, "error");
      } else {
        showToast('Đăng ký thất bại. Vui lòng kiểm tra lại!', "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      
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

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 mt-10 mb-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 tracking-wider mb-2">
            Đăng Ký Tài Khoản
          </h1>
          <p className="text-gray-500">Gia nhập gia đình HieuStore ngay thôi!</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên *</label>
            <input 
              type="text" required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Nguyễn Đức Hiếu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input 
              type="email" required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="admin@hieustore.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu * (Tối thiểu 6 ký tự)</label>
            <input 
              type="password" required minLength="6"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input 
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0987654321"
            />
          </div>
          
          <button type="submit" disabled={loading} className={`w-full py-3 rounded-xl text-white font-bold text-lg transition-all shadow-md mt-4 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {loading ? 'Đang xử lý...' : 'Tạo Tài Khoản'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản? <Link to="/login" className="text-blue-600 hover:underline font-bold">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;