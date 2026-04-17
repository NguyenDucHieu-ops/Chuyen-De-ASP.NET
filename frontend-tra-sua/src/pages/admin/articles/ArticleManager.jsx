import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const ArticleManager = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // 👈 Theo dõi bài đang sửa
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);

  // --- 🔔 THÔNG BÁO HỆ THỐNG ---
  const [notify, setNotify] = useState({ show: false, message: '', type: 'success' });
  const showSystemNotify = (msg, type = 'success') => {
    setNotify({ show: true, message: msg, type });
    setTimeout(() => setNotify({ show: false, message: '', type: 'success' }), 3000);
  };

  const token = localStorage.getItem('hieu_store_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Articles`);
      setArticles(res.data);
    } catch { console.error("Lỗi tải bài viết"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchArticles(); }, []);

  // 🖊️ Mở Modal Sửa
  const openEditModal = (article) => {
    setEditingId(article.id);
    setTitle(article.title);
    setContent(article.content);
    setImage(null);
    setIsModalOpen(true);
  };

  // ➕ Mở Modal Thêm mới
  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setImage(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if(!title || !content) return showSystemNotify("Nhập đủ tiêu đề và nội dung sếp ơi!", "error");

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      if (editingId) {
        // GỬI LỆNH SỬA (POST UPDATE)
        await axios.post(`${import.meta.env.VITE_API_URL}/api/Articles/update/${editingId}`, formData, { headers });
        showSystemNotify("Đã cập nhật bài viết! ✨");
      } else {
        // GỬI LỆNH THÊM MỚI
        await axios.post(`${import.meta.env.VITE_API_URL}/api/Articles`, formData, { headers });
        showSystemNotify("Đã xuất bản bài viết mới! 🚀");
      }
      setIsModalOpen(false);
      fetchArticles();
    } catch { showSystemNotify("Lỗi hệ thống rồi sếp!", "error"); }
  };

  return (
    <div className="space-y-6 relative">
      {/* UI THÔNG BÁO */}
      {notify.show && (
        <div className={`fixed top-10 right-10 z-[110] px-8 py-4 rounded-[1.5rem] font-black uppercase text-[10px] shadow-2xl animate-bounce ${notify.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {notify.type === 'success' ? '✅ ' : '❌ '} {notify.message}
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <h1 className="text-2xl font-black italic uppercase">🖋️ Quản lý <span className="text-blue-600">Bài Viết</span></h1>
        <button onClick={openAddModal} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">+ VIẾT BÀI MỚI</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? <p className="animate-pulse font-black text-gray-400">ĐANG QUÉT BẢN THẢO...</p> : 
        articles.map(item => (
          <div key={item.id} className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all group relative">
            <img src={`${import.meta.env.VITE_API_URL}${item.thumbnail}`} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700" alt="post" />
            <div className="p-8">
              <h3 className="font-black text-gray-800 text-xl mb-3 uppercase italic line-clamp-2 leading-tight">{item.title}</h3>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em] mb-6">🗓️ {new Date(item.createdAt).toLocaleDateString()}</p>
              <div className="flex gap-3">
                <button onClick={() => openEditModal(item)} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-colors">Sửa</button>
                <button onClick={async () => { if(window.confirm("Xóa vĩnh viễn nhé sếp?")) { await axios.delete(`${import.meta.env.VITE_API_URL}/api/Articles/${item.id}`, {headers}); showSystemNotify("Đã xóa bài viết!"); fetchArticles(); } }} className="px-6 py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase hover:bg-rose-500 hover:text-white transition-all">Xóa</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL SOẠN THẢO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-5xl max-h-[95vh] overflow-y-auto p-12 shadow-2xl relative animate-fadeIn">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-4xl font-black text-gray-300 hover:text-gray-900 transition-colors">×</button>
            <h2 className="text-4xl font-black mb-10 uppercase italic text-blue-600 tracking-tighter decoration-4 underline-offset-8 underline decoration-blue-100">
                {editingId ? "Cập nhật bài viết" : "Bản thảo mới"}
            </h2>
            
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Tiêu đề bài viết</label>
                <input type="text" placeholder="Tiêu đề cực cháy..." value={title} onChange={e => setTitle(e.target.value)} className="w-full p-6 bg-gray-50 rounded-[2rem] font-black text-xl outline-none border-2 border-transparent focus:border-blue-500 transition-all" />
              </div>
              
              <div className="mb-16">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Nội dung chi tiết</label>
                <div className="h-[350px] bg-gray-50 rounded-[2rem] overflow-hidden border-2 border-transparent focus-within:border-blue-500 transition-all">
                    <ReactQuill theme="snow" value={content} onChange={setContent} className="h-full font-medium" />
                </div>
              </div>

              <div className="pt-8">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">
                    {editingId ? "Thay ảnh bìa mới (Bỏ trống nếu giữ cũ)" : "Ảnh đại diện bài viết (Thumbnail) *"}
                </label>
                <input type="file" onChange={e => setImage(e.target.files[0])} className="w-full p-5 bg-gray-50 rounded-[2rem] font-black text-xs cursor-pointer" />
              </div>

              <div className="flex gap-6 pt-10">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-6 bg-gray-100 rounded-[2rem] font-black text-gray-400 uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">Đóng lại</button>
                <button onClick={handleSave} className="flex-[2] py-6 bg-blue-600 text-white rounded-[2rem] font-black shadow-2xl shadow-blue-200 uppercase tracking-[0.2em] text-xs hover:bg-blue-700 active:scale-95 transition-all">
                    {editingId ? "Lưu thay đổi ✨" : "Xuất bản bài viết 🚀"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleManager;