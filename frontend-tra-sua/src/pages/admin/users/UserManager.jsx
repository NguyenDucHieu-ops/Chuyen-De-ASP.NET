import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' hoặc 'edit'
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', roleId: 2 });

  const token = localStorage.getItem('hieu_store_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Users`, { headers });
      setUsers(res.data);
    } catch {
      console.error("Lỗi đồng bộ dữ liệu sếp ơi!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Mở Modal Thêm mới
  const openAddModal = () => {
    setModalMode('add');
    setFormData({ fullName: '', email: '', password: '', roleId: 2 });
    setIsModalOpen(true);
  };

  // Mở Modal Chỉnh sửa
  const openEditModal = (user) => {
    setModalMode('edit');
    setFormData({ ...user, password: '' }); // Edit không cần hiện pass cũ
    setIsModalOpen(true);
  };

  // Xử lý Gửi Form (Lưu hoặc Thêm)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/Users`, formData, { headers });
        alert("✨ Đã thêm thành viên mới thành công!");
      } else {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/Users/${formData.id}`, formData, { headers });
        alert("📝 Cập nhật thông tin thành công!");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch {
      alert("❌ Có lỗi xảy ra, sếp kiểm tra lại Backend nhé!");
    }
  };

  // Xử lý Xóa
  const handleDelete = async (id, name) => {
    if (window.confirm(`Sếp có chắc muốn xóa "${name}" không? Thao tác này không thể hoàn tác!`)) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/Users/${id}`, { headers });
        fetchUsers();
      } catch {
        alert("Không thể xóa tài khoản này!");
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      {/* HEADER & TOOLBAR */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 uppercase italic leading-none">Nhân Sự <span className="text-blue-600">HieuStore</span></h1>
          <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-[0.2em]">Hệ thống quản trị tài khoản tập trung</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm tên hoặc email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-sm w-full md:w-80 transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          </div>
          <button 
            onClick={openAddModal}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span> Thêm Thành Viên
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[3rem] shadow-sm overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-32 text-center animate-pulse font-black text-gray-300 uppercase italic tracking-widest">Đang tải dữ liệu nhân sự...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thành Viên</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thông Tin Liên Hệ</th>
                  <th className="p-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Quyền Hạn</th>
                  <th className="p-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-100">
                          {user.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-black text-gray-800 text-lg">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-gray-600">{user.email}</p>
                      <p className="text-[10px] text-gray-400 font-black mt-1 uppercase">ID: {user.id}</p>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        user.roleId === 1 ? 'bg-purple-100 text-purple-600 shadow-sm' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {user.roleId === 1 ? '👑 Admin' : '👤 Khách'}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEditModal(user)} className="p-3 bg-gray-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">📝</button>
                        <button onClick={() => handleDelete(user.id, user.fullName)} className="p-3 bg-gray-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-[zoomIn_0.3s_ease-out] relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 text-2xl font-black">×</button>
            
            <h2 className="text-3xl font-black text-gray-800 mb-8 italic uppercase tracking-tighter">
              {modalMode === 'add' ? 'Thêm thành viên mới' : 'Chỉnh sửa tài khoản'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block">Họ và Tên</label>
                  <input 
                    type="text" 
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block">Địa chỉ Email</label>
                  <input 
                    type="email" 
                    required
                    disabled={modalMode === 'edit'}
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className={`w-full p-4 rounded-2xl font-bold border-2 border-transparent outline-none transition-all ${modalMode === 'edit' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:border-blue-500'}`}
                  />
                </div>

                {modalMode === 'add' && (
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block">Mật khẩu khởi tạo</label>
                    <input 
                      type="password" 
                      required
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block">Vai trò hệ thống</label>
                  <select 
                    value={formData.roleId}
                    onChange={e => setFormData({...formData, roleId: parseInt(e.target.value)})}
                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value={2}>👤 Khách Hàng (Customer)</option>
                    <option value={1}>👑 Quản Trị Viên (Admin)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">
                  {modalMode === 'add' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;