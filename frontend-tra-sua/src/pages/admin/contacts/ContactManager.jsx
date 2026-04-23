import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContactManager = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyText, setReplyText] = useState('');

  const token = localStorage.getItem('hieu_store_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Contacts`, { headers });
      setContacts(res.data);
    } catch { console.error("Lỗi lấy dữ liệu"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchContacts(); }, []);

  // Xử lý gửi câu trả lời
  const handleSendReply = async (e) => {
    e.preventDefault();
    try {
      // 💡 Đã sửa lại thành POST và gửi đúng object { replyMessage: ... }
      await axios.post(`${import.meta.env.VITE_API_URL}/api/Contacts/${selectedContact.id}/reply`, 
        { replyMessage: replyText }, 
        { headers: headers }
      );
      
      alert("✨ Đã gửi phản hồi thành công!");
      setIsReplyModalOpen(false);
      setReplyText('');
      fetchContacts(); // Load lại để hiện status "Đã trả lời"
    } catch (err) {
      alert("❌ Lỗi gửi phản hồi, sếp check lại Backend nhé!");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa tin nhắn này vĩnh viễn?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/Contacts/${id}`, { headers });
        fetchContacts();
      } catch { alert("Không thể xóa!"); }
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* HEADER */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-black italic uppercase text-gray-800 tracking-tighter">Hòm Thư Liên Hệ 📬</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase mt-2 tracking-[0.2em]">Chăm sóc khách hàng HieuStore</p>
         </div>
         <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner">✉️</div>
      </div>

      {/* CONTACT LIST */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <p className="animate-pulse font-black text-gray-300 uppercase text-center py-20 italic">Đang quét hòm thư...</p>
        ) : contacts.length === 0 ? (
          <p className="text-center py-20 font-black text-gray-400 italic bg-white rounded-[3rem] uppercase tracking-widest">Hòm thư trống.</p>
        ) : (
          contacts.map(c => (
            <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row justify-between items-start gap-6 group hover:border-indigo-400 transition-all shadow-sm">
               <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                     <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-100">{c.email}</span>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(c.createdAt).toLocaleString('vi-VN')}</span>
                     
                     {/* 💡 Sửa thành c.isReplied */}
                     {c.isReplied && (
                       <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Đã phản hồi ✅</span>
                     )}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black text-gray-800 uppercase italic tracking-tight">"{c.subject}"</h3>
                    <p className="text-gray-500 font-bold italic mt-2 leading-relaxed">
                      <span className="text-indigo-600 uppercase not-italic mr-2">@{c.fullName}:</span> "{c.message}"
                    </p>
                  </div>

                  {/* 💡 Sửa thành c.replyMessage */}
                  {c.isReplied && (
                    <div className="bg-gray-50 p-5 rounded-2xl border-l-4 border-emerald-400">
                       <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Phản hồi của Admin:</p>
                       <p className="text-gray-600 font-medium italic">"{c.replyMessage}"</p>
                    </div>
                  )}
               </div>

               <div className="flex gap-2 shrink-0">
                  {/* 💡 Đổi điều kiện kiểm tra nút Trả Lời */}
                  {!c.isReplied && (
                    <button 
                      onClick={() => { setSelectedContact(c); setIsReplyModalOpen(true); }}
                      className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      Trả lời
                    </button>
                  )}
                  <button onClick={() => handleDelete(c.id)} className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all font-black">🗑️</button>
               </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL TRẢ LỜI */}
      {isReplyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-[zoomIn_0.3s_ease-out]">
            <h2 className="text-2xl font-black italic uppercase text-gray-800 mb-6 tracking-tighter">Phản hồi khách hàng</h2>
            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase">Khách gửi:</p>
               <p className="text-gray-600 font-bold italic line-clamp-2">"{selectedContact?.message}"</p>
            </div>
            
            <form onSubmit={handleSendReply} className="space-y-6">
              <textarea 
                required
                rows="4"
                placeholder="Nhập nội dung phản hồi tại đây..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold border-2 border-transparent focus:border-indigo-500 outline-none transition-all resize-none"
              ></textarea>
              
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsReplyModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200">Hủy</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">Gửi Ngay 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManager;