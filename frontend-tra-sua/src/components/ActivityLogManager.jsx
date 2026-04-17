import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActivityLogManager = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const token = localStorage.getItem('hieu_store_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/ActivityLogs`, { headers });
      setLogs(res.data);
    } catch {
      console.error("Lỗi lấy dữ liệu lịch sử!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  // Hàm "dịch" tên bảng tiếng Anh sang tiếng Việt cho sếp dễ đọc
  const translateEntity = (entityName) => {
    const dict = { "Product": "Sản Phẩm", "Category": "Danh Mục", "User": "Nhân Sự", "Voucher": "Khuyến Mãi" };
    return dict[entityName] || entityName;
  };

  // Hàm định dạng màu sắc cho Hành Động
  const getActionStyle = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DELETE': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getActionName = (action) => {
    switch (action) {
      case 'CREATE': return 'Thêm Mới';
      case 'UPDATE': return 'Chỉnh Sửa';
      case 'DELETE': return 'Đã Xóa';
      default: return action;
    }
  };

  return (
    <div className="space-y-6 relative animate-[fadeIn_0.5s_ease-out]">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight italic uppercase">Camera <span className="text-blue-600">Hệ Thống</span></h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Nhật ký hoạt động của Quản Trị Viên (100 log mới nhất)</p>
        </div>
        <button onClick={fetchLogs} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-gray-800 transition-all active:scale-95 text-xs tracking-widest">
          🔄 LÀM MỚI DỮ LIỆU
        </button>
      </div>

      {/* BẢNG LOG */}
      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">
            <tr>
              <th className="p-6">Thời Gian</th>
              <th className="p-6">Quản Trị Viên</th>
              <th className="p-6 text-center">Hành Động</th>
              <th className="p-6 text-center">Mục Tác Động</th>
              <th className="p-6 text-right">Chi Tiết</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" className="p-20 text-center font-black text-gray-300 italic animate-pulse uppercase">Đang check camera...</td></tr> : 
            logs.length === 0 ? <tr><td colSpan="5" className="p-20 text-center font-bold text-gray-400">Chưa có hoạt động nào được ghi nhận.</td></tr> :
            logs.map(log => (
              <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all">
                <td className="p-6 font-bold text-gray-600 text-sm">
                  {new Date(log.timestamp).toLocaleString('vi-VN')}
                </td>
                <td className="p-6 font-black text-gray-800 text-sm uppercase">
                  {log.adminName}
                </td>
                <td className="p-6 text-center">
                  <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getActionStyle(log.actionType)}`}>
                    {getActionName(log.actionType)}
                  </span>
                </td>
                <td className="p-6 text-center font-bold text-gray-600">
                  {translateEntity(log.entityName)} (ID: #{log.entityId})
                </td>
                <td className="p-6 text-right">
                  <button onClick={() => setSelectedLog(log)} className="text-blue-600 font-black hover:text-blue-800 uppercase text-[10px] tracking-widest underline decoration-2 underline-offset-4">
                    Xem JSON
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL XEM CHI TIẾT JSON (DÀNH CHO SẾP SOI DỮ LIỆU) */}
      {selectedLog && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-3xl flex flex-col max-h-[90vh] shadow-2xl relative overflow-hidden">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-2xl font-black text-gray-800 uppercase italic">Chi Tiết Hoạt Động</h2>
                <p className="text-[10px] text-gray-500 font-bold tracking-widest mt-1 uppercase">Bởi: {selectedLog.adminName} - Lúc: {new Date(selectedLog.timestamp).toLocaleString('vi-VN')}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-3xl font-black text-gray-400 hover:text-red-500 transition-colors">×</button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-900">
              {/* Dữ liệu cũ */}
              {selectedLog.oldValues && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Dữ liệu cũ (Trước khi sửa/xóa)</span>
                  <pre className="bg-black text-rose-300 p-4 rounded-2xl text-[10px] font-mono overflow-x-auto border border-rose-900/50 shadow-inner">
                    {JSON.stringify(JSON.parse(selectedLog.oldValues), null, 2)}
                  </pre>
                </div>
              )}
              {/* Dữ liệu mới */}
              {selectedLog.newValues && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Dữ liệu mới (Sau khi thêm/sửa)</span>
                  <pre className="bg-black text-emerald-300 p-4 rounded-2xl text-[10px] font-mono overflow-x-auto border border-emerald-900/50 shadow-inner">
                    {JSON.stringify(JSON.parse(selectedLog.newValues), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogManager;