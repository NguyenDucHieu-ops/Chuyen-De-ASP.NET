import React, { useState } from 'react';
import axios from 'axios';

const ContactPage = () => {
  const [form, setForm] = useState({ fullName: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/Contacts`, form);
      alert("Cảm ơn Hiếu đã góp ý! Lời nhắn đã được gửi đi. ✨");
      setForm({ fullName: '', email: '', subject: '', message: '' });
    } catch { alert("Lỗi gửi tin!"); }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 animate-fadeIn">
      <div className="space-y-6">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-gray-800">Liên hệ <br/><span className="text-blue-600">HieuStore</span></h1>
        <p className="text-gray-500 font-medium leading-relaxed">Chúng mình luôn lắng nghe mọi ý kiến từ bạn. Đừng ngần ngại chia sẻ trải nghiệm nhé!</p>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
           <p className="flex items-center gap-3 font-bold text-gray-700">📍 Phước Long B, Thủ Đức, HCM</p>
           <p className="flex items-center gap-3 font-bold text-gray-700">📞 090x.xxx.xxx</p>
           <p className="flex items-center gap-3 font-bold text-gray-700">✉️ hieustore@contact.com</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-50 space-y-4">
        <input type="text" placeholder="Họ tên của bạn" required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-all" />
        <input type="email" placeholder="Email liên hệ" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-all" />
        <input type="text" placeholder="Chủ đề" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-all" />
        <textarea placeholder="Lời nhắn gửi đến Hiếu..." required rows="4" value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-all resize-none" />
        <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">Gửi Lời Nhắn</button>
      </form>
    </div>
  );
};

export default ContactPage;