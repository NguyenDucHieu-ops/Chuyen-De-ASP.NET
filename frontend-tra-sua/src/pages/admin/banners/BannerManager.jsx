import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [image, setImage] = useState(null);

  // --- 🔔 HỆ THỐNG THÔNG BÁO XỊN ---
  const [notify, setNotify] = useState({ show: false, message: '', type: 'success' });

  const showSystemNotify = (msg, type = 'success') => {
    setNotify({ show: true, message: msg, type });
    setTimeout(() => setNotify({ show: false, message: '', type: 'success' }), 3000);
  };

  const token = localStorage.getItem('hieu_store_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Banners`);
      setBanners(res.data);
    } catch { 
      console.error("Lỗi tải dữ liệu banner"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const openEditModal = (banner) => {
    setEditingId(banner.id);
    setTitle(banner.title);
    setLinkUrl(banner.linkUrl);
    setImage(null);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setLinkUrl('');
    setImage(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Sếp có chắc muốn xóa banner này không?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/Banners/${id}`, { headers });
        showSystemNotify("Đã dọn dẹp banner xong! 🗑️");
        fetchBanners();
      } catch {
        showSystemNotify("Lỗi xóa banner!", "error");
      }
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
        showSystemNotify("Tiêu đề không được để trống sếp ơi!", "error");
        return;
    }
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('linkUrl', linkUrl);
    if (image) formData.append('image', image);

    try {
      if (editingId) {
        // 💡 ĐỔI TỪ PUT SANG POST VÀ THÊM /update/ ĐỂ FIX LỖI 405
        await axios.post(`${import.meta.env.VITE_API_URL}/api/Banners/update/${editingId}`, formData, { 
          headers: { ...headers, 'Content-Type': 'multipart/form-data' } 
        });
        showSystemNotify("Cập nhật banner mới thành công! ✨");
      } else {
        if (!image) { showSystemNotify("Chưa chọn ảnh sếp ơi!", "error"); return; }
        await axios.post(`${import.meta.env.VITE_API_URL}/api/Banners`, formData, { 
          headers: { ...headers, 'Content-Type': 'multipart/form-data' } 
        });
        showSystemNotify("HieuStore đã có banner mới! 🎉");
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err) { 
        showSystemNotify("Server đang bận (Lỗi " + (err.response?.status || "500") + ")", "error");
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* 🔔 NOTIFICATION UI */}
      {notify.show && (
        <div className={`fixed top-10 right-10 z-[110] px-8 py-4 rounded-[1.5rem] font-black uppercase text-[10px] shadow-2xl animate-bounce ${notify.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {notify.type === 'success' ? '✅ ' : '❌ '} {notify.message}
        </div>
      )}

      {/* HEADER PAGE */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <h1 className="text-2xl font-black italic uppercase text-gray-800 tracking-tighter">🖼️ Quản lý <span className="text-blue-600">Banner</span></h1>
        <button onClick={openAddModal} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95 text-xs tracking-widest">+ THÊM BANNER</button>
      </div>

      {/* BANNER LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          <p className="p-20 text-center font-black text-gray-300 uppercase italic animate-pulse">Đang tải tài nguyên hệ thống...</p>
        ) : (
          banners.map(b => (
            <div key={b.id} className="relative group overflow-hidden rounded-[3rem] shadow-md border-4 border-white transition-all hover:shadow-2xl">
              <img 
                src={`${import.meta.env.VITE_API_URL}${b.imageUrl}`} 
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700" 
                onError={(e) => e.target.src = 'https://placehold.co/800x400?text=Banner+HieuStore'}
                alt="banner" 
              />
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <button onClick={() => openEditModal(b)} className="bg-white text-blue-600 px-10 py-3 rounded-xl font-black text-[10px] hover:bg-blue-600 hover:text-white transition-all shadow-lg uppercase tracking-widest">Chỉnh sửa</button>
                 <button onClick={() => handleDelete(b.id)} className="bg-rose-500 text-white px-10 py-3 rounded-xl font-black text-[10px] hover:bg-rose-700 transition-all shadow-lg uppercase tracking-widest">Xóa bỏ</button>
              </div>
              <div className="absolute bottom-6 left-8 text-white font-black uppercase text-lg drop-shadow-2xl italic tracking-tighter">{b.title}</div>
            </div>
          ))
        )}
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-12 shadow-2xl animate-[zoomIn_0.3s_ease-out]">
            <h2 className="text-3xl font-black mb-10 uppercase text-blue-600 italic tracking-tighter underline decoration-4 underline-offset-8">
              {editingId ? "Sửa nội dung banner" : "Tạo thiết kế banner"}
            </h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Tiêu đề quảng bá</label>
                <input type="text" placeholder="Nhập tiêu đề..." value={title} onChange={e => setTitle(e.target.value)} className="w-full p-5 bg-gray-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-blue-500 transition-all" />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Đường dẫn liên kết</label>
                <input type="text" placeholder="/products" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="w-full p-5 bg-gray-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-blue-500 transition-all" />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">
                    {editingId ? "Thay ảnh mới (Bỏ trống nếu giữ cũ)" : "Hình ảnh Banner (Ưu tiên ảnh ngang)"}
                </label>
                <input type="file" onChange={e => setImage(e.target.files[0])} className="w-full p-4 bg-gray-50 rounded-2xl font-black text-xs cursor-pointer" />
              </div>

              <div className="flex gap-4 pt-6">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-gray-100 rounded-2xl font-black text-gray-400 uppercase text-[10px] tracking-widest hover:bg-gray-200">Đóng</button>
                <button onClick={handleSave} className="flex-[2] py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl uppercase text-[10px] tracking-widest hover:bg-blue-700 active:scale-95 transition-all">
                   {editingId ? "Lưu thay đổi 💾" : "Xuất bản banner 🚀"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManager;