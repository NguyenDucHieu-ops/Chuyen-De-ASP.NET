import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContactManager = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${localStorage.getItem('hieu_store_token')}` };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Contacts`, { headers });
      setContacts(res.data);
    } catch { console.error("Lỗi lấy dữ liệu"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Xóa tin nhắn này vĩnh viễn?")) {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/Contacts/${id}`, { headers });
      fetchContacts();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-black italic uppercase text-gray-800 tracking-tighter">Hòm Thư Liên Hệ 📬</h1>
            <p className="text-xs font-bold text-gray-400 uppercase mt-2 tracking-widest">Phản hồi và góp ý từ khách hàng</p>
         </div>
         <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner">✉️</div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <p className="animate-pulse font-black text-gray-300 uppercase text-center py-20">Đang quét hòm thư...</p>
        ) : contacts.length === 0 ? (
          <p className="text-center py-20 font-bold text-gray-400 italic bg-white rounded-3xl">Hòm thư hiện đang trống.</p>
        ) : (
          contacts.map(c => (
            <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-wrap md:flex-nowrap justify-between items-start group hover:border-blue-400 transition-all shadow-sm">
               <div className="space-y-3">
                  <div className="flex items-center gap-4">
                     <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-md">{c.email}</span>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                       {new Date(c.createdAt).toLocaleString('vi-VN')}
                     </span>
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 uppercase italic tracking-tight">"{c.subject}"</h3>
                  <p className="text-gray-600 font-bold italic text-lg leading-relaxed">- {c.fullName}: "{c.message}"</p>
               </div>
               <button onClick={() => handleDelete(c.id)} className="p-5 text-gray-200 hover:text-red-500 transition-colors text-4xl font-black">×</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactManager;