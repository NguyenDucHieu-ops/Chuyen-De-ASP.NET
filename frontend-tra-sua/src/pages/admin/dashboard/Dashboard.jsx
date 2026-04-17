import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Tổng Đơn Hàng", value: "0", icon: "🛒", color: "blue" },
    { label: "Doanh Thu", value: "0đ", icon: "💰", color: "green" },
    { label: "Sản Phẩm", value: "0", icon: "🧋", color: "orange" },
    { label: "Khách Hàng", value: "0", icon: "👥", color: "purple" }
  ]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('hieu_store_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // GỌI ĐÚNG API: /api/Orders thay vì /history để lấy toàn bộ dữ liệu shop
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/Orders`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Products`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Users`, { headers })
        ]);

        // FIX LỖI: Đảm bảo orders luôn là mảng để không bị crash filter
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const products = Array.isArray(productsRes.data) ? productsRes.data : [];
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];

        // 1. Tính tổng doanh thu từ các đơn hàng Thành Công (Status "2")
        // Lưu ý: So sánh chuỗi "2" vì DB của sếp lưu OrderStatus là string
        const totalRevenue = orders
          .filter(o => String(o.status) === '2')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // 2. Cập nhật mảng Stats
        setStats([
          { label: "Tổng Đơn Hàng", value: orders.length.toLocaleString(), icon: "🛒", color: "blue" },
          { label: "Doanh Thu", value: totalRevenue.toLocaleString() + "đ", icon: "💰", color: "green" },
          { label: "Sản Phẩm", value: products.length.toLocaleString(), icon: "🧋", color: "orange" },
          { label: "Khách Hàng", value: users.length.toLocaleString(), icon: "👥", color: "purple" }
        ]);

        // 3. Lấy 5 đơn hàng mới nhất
        setRecentOrders(orders.slice(0, 5));

      } catch (err) {
        console.error("Lỗi đồng bộ Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Hàm hiển thị Badge cho bảng Recent Orders
  const getMiniStatus = (status) => {
    const s = String(status);
    if (s === "2") return <span className="text-[8px] font-black text-emerald-500 uppercase">Thành công</span>;
    if (s === "3") return <span className="text-[8px] font-black text-rose-500 uppercase">Đã hủy</span>;
    return <span className="text-[8px] font-black text-amber-500 uppercase">Đang xử lý</span>;
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-500">{stat.icon}</div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-3xl font-black text-gray-800 mt-2">
              {loading ? <span className="animate-pulse italic text-gray-200">Wait...</span> : stat.value}
            </h3>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gray-50 rounded-full opacity-50"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* RECENT ORDERS */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-xl italic text-indigo-600 underline decoration-2 underline-offset-8 uppercase">Đơn Hàng Gần Đây</h3>
            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg uppercase">Live Update</span>
          </div>
          
          <div className="space-y-4">
            {loading ? (
               [1,2,3].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-2xl"></div>)
            ) : recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center p-5 bg-gray-50/50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all group">
                  <div>
                    <div className="font-black text-gray-800 italic text-sm group-hover:text-indigo-600 transition-colors">#ORD-{order.id}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-indigo-600 font-black">{(order.totalAmount || 0).toLocaleString()}đ</div>
                    <div className="mt-1">{getMiniStatus(order.status)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 font-bold italic">Chưa phát sinh đơn hàng nào.</div>
            )}
          </div>
        </div>
        
        {/* SQL SERVER STATUS */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className={`w-24 h-24 ${loading ? 'bg-gray-100' : 'bg-emerald-50'} rounded-full flex items-center justify-center text-4xl mb-6 mx-auto shadow-inner border border-emerald-100`}>
              {loading ? "⏳" : "⚡"}
            </div>
            <h3 className="font-black text-xl uppercase tracking-tight text-gray-800 italic">Database Online</h3>
            <p className="text-sm text-gray-400 mt-3 max-w-[250px] font-medium leading-relaxed">
              Dữ liệu được cập nhật thời gian thực từ <span className="text-indigo-600 font-black">SQL Server</span> của sếp.
            </p>
            {!loading && (
              <div className="mt-6 inline-block px-6 py-2 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase">
                Last Sync: {new Date().toLocaleTimeString()}
              </div>
            )}
          </div>
          <div className="absolute -top-10 -right-10 opacity-5 text-9xl font-black italic select-none">DB</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;