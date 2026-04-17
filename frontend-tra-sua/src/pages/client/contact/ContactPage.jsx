import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ContactPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('hieu_store_token');
  
  const [form, setForm] = useState({ fullName: '', email: '', subject: '', message: '' });
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tự động điền tên và email nếu đã đăng nhập
  useEffect(() => {
    if (token) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/Users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setForm(prev => ({ ...prev, fullName: res.data.fullName, email: res.data.email }));
      }).catch(() => {});
      
      fetchHistory(); // Gọi hàm lấy lịch sử
    }
  }, [token]);

  // Hàm lấy lịch sử liên hệ của user
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Contacts/my-contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Chưa có API lấy lịch sử hoặc lỗi", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Gửi token đi để backend biết ai đang gửi
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.post(`${import.meta.env.VITE_API_URL}/api/Contacts`, form, config);
      
      alert("✅ Cảm ơn bạn đã góp ý! Lời nhắn đã được ghi nhận.");
      setForm(prev => ({ ...prev, subject: '', message: '' })); // Chỉ xóa chủ đề và lời nhắn, giữ lại tên/email
      
      if (token) fetchHistory(); // Load lại lịch sử ngay lập tức
    } catch (err) { 
      console.error(err);
      alert("❌ Có lỗi xảy ra khi gửi tin, vui lòng kiểm tra lại!"); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-[fadeIn_0.5s_ease-out]">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-gray-900 mb-4">
          Trung tâm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Hỗ trợ</span>
        </h1>
        <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">
          HieuStore luôn lắng nghe bạn. Hãy để lại lời nhắn hoặc xem phản hồi từ chúng mình tại đây nhé!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* CỘT TRÁI: FORM LIÊN HỆ */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl text-white space-y-6 relative overflow-hidden">
            <h3 className="text-2xl font-black tracking-tight relative z-10">Gửi lời nhắn trực tiếp</h3>
            <div className="space-y-4 relative z-10 text-indigo-100 font-medium">
              <p className="flex items-center gap-3"><span>📍</span> Phước Long B, Thủ Đức, HCM</p>
              <p className="flex items-center gap-3"><span>📞</span> 1900 xxxx (8h00 - 22h00)</p>
              <p className="flex items-center gap-3"><span>✉️</span> support@hieustore.com</p>
            </div>
            <div className="absolute -bottom-10 -right-10 text-9xl opacity-20 font-black italic select-none">?</div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2 mb-2 block">Thông tin của bạn</label>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Họ tên" required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
            </div>
            <div>
              <input type="text" placeholder="Chủ đề (VD: Giao hàng chậm, Sản phẩm lỗi...)" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div>
              <textarea placeholder="Chi tiết lời nhắn gửi đến HieuStore..." required rows="5" value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:shadow-2xl active:scale-95 disabled:opacity-70 transition-all">
              {isSubmitting ? 'Đang gửi...' : 'Gửi Lời Nhắn'}
            </button>
          </form>
        </div>

        {/* CỘT PHẢI: LỊCH SỬ LIÊN HỆ & CÂU TRẢ LỜI CỦA ADMIN */}
        <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
            <span className="w-2 h-8 bg-indigo-600 rounded-full inline-block"></span>
            Lịch sử hỗ trợ của bạn
          </h2>

          {!token ? (
            <div className="text-center py-16 bg-gray-50 rounded-3xl">
              <span className="text-5xl mb-4 block">🔒</span>
              <p className="font-bold text-gray-600 mb-4">Vui lòng đăng nhập để xem lịch sử lời nhắn và phản hồi từ Admin.</p>
              <button onClick={() => navigate('/login')} className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors">Đăng nhập ngay</button>
            </div>
          ) : loadingHistory ? (
            <div className="text-center py-10 animate-pulse font-bold text-gray-400">Đang tải hộp thư...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <span className="text-5xl mb-4 block">📭</span>
              <p className="font-bold text-gray-500">Bạn chưa gửi lời nhắn nào cho HieuStore.</p>
            </div>
          ) : (
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {history.map(item => (
                <div key={item.id} className="p-6 rounded-3xl border-2 border-gray-50 bg-gray-50/50 hover:border-indigo-100 transition-colors space-y-4">
                  {/* Header của Ticket */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{item.subject}</h4>
                      <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                        🕒 {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap ${
                      item.isRead ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.isRead ? '✓ Đã phản hồi' : '⏳ Chờ xử lý'}
                    </span>
                  </div>
                  
                  {/* Nội dung khách gửi */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 text-sm text-gray-600">
                    <span className="font-bold text-gray-900 block mb-1">Bạn:</span>
                    {item.message}
                  </div>

                  {/* Phần Admin trả lời (Nếu C# của bạn có thêm cột Reply/AdminResponse) */}
                  {item.isRead && (
                    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 text-sm text-indigo-900 relative">
                      <div className="absolute -left-2 top-4 w-4 h-4 bg-indigo-50 rotate-45 border-l border-b border-indigo-100"></div>
                      <span className="font-black text-indigo-700 block mb-1 flex items-center gap-2">
                        <span className="text-lg">🧋</span> Admin HieuStore:
                      </span>
                      {item.reply || "Cảm ơn bạn đã góp ý. Chúng tôi đã tiếp nhận và đang xử lý yêu cầu của bạn!"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;