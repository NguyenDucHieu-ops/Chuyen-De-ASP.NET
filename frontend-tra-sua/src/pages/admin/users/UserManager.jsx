import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [ setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Users`);
      setUsers(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-black text-gray-800 uppercase italic">Quản Lý Nhân Sự & Khách Hàng 👥</h1>
        <p className="text-xs text-gray-400 font-bold mt-1">Danh sách tài khoản trên hệ thống</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 font-black uppercase">
            <tr>
              <th className="p-4">Họ Tên</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-center">Vai Trò</th>
              <th className="p-4 text-right">Ngày Tham Gia</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">{user.fullName?.charAt(0)}</div>
                    <span className="font-black text-gray-700">{user.fullName}</span>
                  </div>
                </td>
                <td className="p-4 font-bold text-gray-500">{user.email}</td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${user.roleId === 1 ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                    {user.roleId === 1 ? 'Admin' : 'Khách Hàng'}
                  </span>
                </td>
                <td className="p-4 text-right text-sm text-gray-400 font-bold">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager;