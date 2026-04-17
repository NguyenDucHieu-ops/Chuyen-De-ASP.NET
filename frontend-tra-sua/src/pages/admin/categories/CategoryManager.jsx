import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryManager = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);

  const [notify, setNotify] = useState({ show: false, message: '', type: 'success' });

  const showSystemNotify = (msg, type = 'success') => {
    setNotify({ show: true, message: msg, type });
    setTimeout(() => setNotify({ show: false, message: '', type: 'success' }), 3000);
  };

  const token = localStorage.getItem('hieu_store_token');
  const headers = { Authorization: `Bearer ${token}` };

  const [formData, setFormData] = useState({ 
    categoryName: '', 
    description: '',
    isActive: true 
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Categories`);
      setDataList(res.data);
    } catch { 
      // Đã xóa bỏ (err) để ESLint không gạch đít nữa
      showSystemNotify("Lỗi tải danh sách!", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggleStatus = async (cat) => {
    try {
      const updated = { 
        id: cat.id, 
        categoryName: cat.categoryName, 
        isActive: !cat.isActive 
      };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/Categories/${cat.id}`, updated, { headers });
      showSystemNotify(`Đã ${updated.isActive ? 'Bật' : 'Tắt'} danh mục!`);
      fetchData();
    } catch { showSystemNotify("Lỗi cập nhật trạng thái!", "error"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa danh mục này có thể làm mất sản phẩm liên quan. Bạn chắc chứ?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/Categories/${id}`, { headers });
        showSystemNotify("Đã xóa danh mục thành công!");
        fetchData();
      } catch { showSystemNotify("Lỗi xóa dữ liệu!", "error"); }
    }
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({ 
      categoryName: item.categoryName, 
      description: item.description || '', // Giữ lại UI để sếp không mất giao diện
      isActive: item.isActive ?? true 
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.categoryName.trim()) { 
      showSystemNotify("Sếp quên nhập tên Danh mục kìa!", "error"); 
      return; 
    }

    try {
      if (editingId) {
        const payload = { id: editingId, ...formData };
        await axios.put(`${import.meta.env.VITE_API_URL}/api/Categories/${editingId}`, payload, { headers });
        showSystemNotify("Lưu thay đổi thành công! ✨");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/Categories`, formData, { headers });
        showSystemNotify("Thêm danh mục mới thành công! 🎉");
      }
      setIsModalOpen(false);
      fetchData();
    } catch { showSystemNotify("Lỗi lưu dữ liệu. Sếp check lại Token nhé!", "error"); }
  };

  return (
    <div className="space-y-6 relative">
      
      {notify.show && (
        <div className={`fixed top-10 right-10 z-[100] px-8 py-4 rounded-[1.5rem] font-black uppercase text-xs shadow-2xl animate-bounce transition-all ${notify.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {notify.type === 'success' ? '✅ ' : '❌ '} {notify.message}
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-800 italic">📂 Quản Lý Danh Mục</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Phân loại menu của HieuStore</p>
        </div>
        <button onClick={() => { setEditingId(null); setFormData({ categoryName: '', description: '', isActive: true }); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95 text-xs tracking-widest"
        >+ THÊM MỚI</button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-black uppercase tracking-widest">
            <tr>
              <th className="p-6">Tên Danh Mục</th>
              <th className="p-6 text-center">Trạng Thái</th>
              <th className="p-6 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="3" className="p-10 text-center animate-pulse text-gray-400 font-black uppercase italic">Đang đồng bộ SQL Server...</td></tr> : 
            dataList.map(item => (
              <tr key={item.id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition-all ${!item.isActive ? 'opacity-50' : ''}`}>
                <td className="p-6 font-black text-gray-700 uppercase tracking-tighter text-lg">{item.categoryName}</td>
                <td className="p-6 text-center">
                  <button 
                    onClick={() => handleToggleStatus(item)}
                    className={`px-4 py-2 rounded-full text-[9px] font-black uppercase transition-all ${item.isActive ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-red-100 text-red-600 border border-red-200'}`}
                  >
                    {item.isActive ? '● Hiển Thị' : '○ Đang Ẩn'}
                  </button>
                </td>
                <td className="p-6 text-right space-x-3">
                   <button onClick={() => { setSelectedCat(item); setIsDetailOpen(true); }} className="text-gray-400 font-bold hover:text-blue-600 uppercase text-xs">Chi tiết</button>
                   <button onClick={() => openEditModal(item)} className="p-2 text-blue-600 font-black underline uppercase text-xs">Sửa</button>
                   <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 font-bold uppercase text-xs">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isDetailOpen && selectedCat && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl text-center relative">
            <button onClick={() => setIsDetailOpen(false)} className="absolute top-6 right-6 text-2xl font-black text-gray-300 hover:text-gray-800">×</button>
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">📂</div>
            <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter italic">{selectedCat.categoryName}</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase mt-1 mb-6 tracking-widest text-center">Mã danh mục: #{selectedCat.id}</p>
            <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 text-left mb-6">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Mô tả danh mục:</p>
                <p className="font-bold text-gray-700 italic">"{selectedCat.description || 'Chưa cập nhật mô tả...'}"</p>
            </div>
            <button onClick={() => setIsDetailOpen(false)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black shadow-lg uppercase tracking-widest text-xs hover:bg-gray-800">ĐÓNG</button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-fadeIn">
            <h2 className="text-xl font-black mb-6 uppercase italic text-center tracking-tighter text-blue-600">{editingId ? "Cập Nhật Danh Mục" : "Tạo Danh Mục Mới"}</h2>
            <div className="space-y-4">
               <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3 mb-1 block">Tên Danh Mục</label>
                 <input type="text" value={formData.categoryName} onChange={e => setFormData({...formData, categoryName: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-black border-2 border-transparent focus:border-blue-500 outline-none transition-all text-lg" />
               </div>
               <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3 mb-1 block">Mô tả chi tiết</label>
                 <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-blue-500 outline-none h-24 italic" />
               </div>
               <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Kích hoạt hiển thị</span>
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-6 h-6 accent-blue-600 cursor-pointer" />
               </div>
            </div>
            <div className="flex gap-4 mt-8">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-400 text-xs tracking-widest hover:bg-gray-200">HỦY</button>
               <button onClick={handleSave} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 text-xs tracking-widest uppercase hover:bg-blue-700 active:scale-95">LƯU LẠI 🚀</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;