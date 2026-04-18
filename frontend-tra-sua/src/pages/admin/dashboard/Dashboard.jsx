import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month', 'year'
  const [data, setData] = useState({
    orders: [],
    products: [],
    users: [],
    categories: []
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('hieu_store_token');
        const headers = { Authorization: `Bearer ${token}` };
        const [ordersRes, productsRes, usersRes, catsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/Orders`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Products`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Users`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Categories`, { headers })
        ]);
        setData({
          orders: ordersRes.data || [],
          products: productsRes.data || [],
          users: usersRes.data || [],
          categories: catsRes.data || []
        });
      } catch (err) {
        console.error("Lỗi báo cáo:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // 📈 LOGIC PHÂN TÍCH DỮ LIỆU ĐA CHIỀU
  const analytics = useMemo(() => {
    const { orders, products, categories } = data;
    const now = new Date();
    const successOrders = orders.filter(o => String(o.status) === '2');

    // 1. Lọc đơn hàng theo thời gian được chọn
    const filteredByRange = successOrders.filter(o => {
      const date = new Date(o.createdAt);
      if (timeRange === 'day') return date.toDateString() === now.toDateString();
      if (timeRange === 'week') return (now - date) / (1000 * 60 * 60 * 24) <= 7;
      if (timeRange === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      if (timeRange === 'year') return date.getFullYear() === now.getFullYear();
      return true;
    });

    const totalRevenue = filteredByRange.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // 2. Xử lý dữ liệu biểu đồ (Grouping)
    let chartData = [];
    if (timeRange === 'day') {
      // Nhóm theo giờ
      const hours = Array.from({length: 24}, (_, i) => ({ name: `${i}h`, revenue: 0 }));
      filteredByRange.forEach(o => {
        const h = new Date(o.createdAt).getHours();
        hours[h].revenue += o.totalAmount;
      });
      chartData = hours;
    } else if (timeRange === 'year') {
      // Nhóm theo tháng
      const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"].map(m => ({ name: m, revenue: 0 }));
      filteredByRange.forEach(o => {
        const m = new Date(o.createdAt).getMonth();
        months[m].revenue += o.totalAmount;
      });
      chartData = months;
    } else {
      // Nhóm theo ngày (cho tuần và tháng)
      const groups = {};
      filteredByRange.forEach(o => {
        const d = new Date(o.createdAt).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'});
        groups[d] = (groups[d] || 0) + o.totalAmount;
      });
      chartData = Object.keys(groups).map(k => ({ name: k, revenue: groups[k] }));
    }

    const pieData = categories.map(cat => ({
      name: cat.categoryName,
      value: products.filter(p => p.categoryId === cat.id).length
    }));

    return { totalRevenue, count: filteredByRange.length, chartData, pieData };
  }, [data, timeRange]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="font-black text-indigo-900 uppercase italic animate-pulse tracking-widest text-sm">Hệ thống đang tổng hợp báo cáo...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out] pb-10">
      {/* 👑 HEADER & TIME FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">Trung Tâm <span className="text-indigo-600">Điều Hành</span></h1>
          <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-[0.2em]">Báo cáo hiệu suất kinh doanh đa chiều</p>
        </div>
        
        {/* 🕒 BỘ LỌC THỜI GIAN THẦN THÁNH */}
        <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem] self-stretch md:self-auto shadow-inner">
          {[
            { id: 'day', label: 'Ngày' },
            { id: 'week', label: 'Tuần' },
            { id: 'month', label: 'Tháng' },
            { id: 'year', label: 'Năm' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setTimeRange(btn.id)}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === btn.id ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 📊 KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: `D.Thu ${timeRange.toUpperCase()}`, val: analytics.totalRevenue.toLocaleString() + "đ", icon: "💎", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: `Đơn ${timeRange.toUpperCase()}`, val: analytics.count, icon: "📦", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Sản phẩm", val: data.products.length, icon: "🧋", color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Khách hàng", val: data.users.length, icon: "🤝", color: "text-purple-600", bg: "bg-purple-50" }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
             <div className="flex justify-between items-start relative z-10">
                <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">{kpi.icon}</span>
                <div className={`w-8 h-8 rounded-full ${kpi.bg} flex items-center justify-center animate-pulse`}></div>
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6 relative z-10">{kpi.label}</p>
             <h3 className={`text-2xl font-black mt-1 ${kpi.color} relative z-10`}>{kpi.val}</h3>
             <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        ))}
      </div>

      {/* 📈 DYNAMIC CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
             <div>
                <h3 className="font-black text-gray-800 uppercase italic tracking-tighter">Biểu đồ doanh thu</h3>
                <p className="text-[9px] font-bold text-indigo-500 uppercase">Đang xem dữ liệu theo {timeRange}</p>
             </div>
             <div className="text-right">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Thời điểm hiện tại</p>
                <p className="text-sm font-black text-gray-800">{new Date().toLocaleTimeString()}</p>
             </div>
          </div>
          
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-20"></div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center justify-between">
           <div className="w-full text-left">
              <h3 className="font-black text-gray-800 uppercase italic tracking-tighter">Cơ cấu hàng hóa</h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Phân loại theo danh mục</p>
           </div>
           
           <div className="h-[280px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={analytics.pieData}
                   innerRadius={70}
                   outerRadius={95}
                   paddingAngle={8}
                   dataKey="value"
                   animationBegin={0}
                   animationDuration={1500}
                 >
                   {analytics.pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
                 <Legend verticalAlign="bottom" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />
               </PieChart>
             </ResponsiveContainer>
           </div>
           
           <div className="w-full bg-indigo-600 p-5 rounded-[2rem] text-white flex justify-between items-center shadow-lg shadow-indigo-100 mt-4">
              <div className="text-left">
                 <p className="text-[8px] font-black uppercase opacity-70">Top Category</p>
                 <p className="font-black uppercase tracking-tighter truncate w-32">
                   {analytics.pieData.sort((a,b) => b.value - a.value)[0]?.name || "N/A"}
                 </p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black">⭐</div>
           </div>
        </div>
      </div>

      {/* 📑 RECENT ACTIVITY & SYSTEM STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                <h3 className="font-black text-gray-800 uppercase italic tracking-tighter text-xl">Lệnh đặt hàng mới nhất</h3>
             </div>
             <div className="space-y-4">
                {data.orders.slice(0, 4).map(o => (
                  <div key={o.id} className="flex justify-between items-center p-5 bg-gray-50/50 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-indigo-50 group">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-[10px] shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">ORD-{o.id}</div>
                        <div>
                           <p className="text-sm font-black text-gray-800 uppercase leading-none">{o.customerName || "Khách vãng lai"}</p>
                           <p className="text-[10px] font-bold text-gray-400 mt-1.5">{new Date(o.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="font-black text-indigo-600 text-lg tracking-tighter">{o.totalAmount?.toLocaleString()}đ</p>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${String(o.status) === '2' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                           {String(o.status) === '2' ? 'Xong' : 'Chờ'}
                        </span>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-zinc-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white flex flex-col justify-between">
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 mb-8">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest">Global Data Center Online</span>
                </div>
                <h3 className="text-5xl font-black italic uppercase leading-[0.9] tracking-tighter">Hệ Thống <br /> <span className="text-indigo-400">Bền Vững</span></h3>
                <p className="text-gray-400 text-xs mt-6 max-w-xs font-bold leading-relaxed uppercase tracking-widest">
                  Auto-scaling architecture with .NET 8 and MS SQL Server High Availability.
                </p>
             </div>
             
             <div className="relative z-10 flex gap-6 mt-10">
                <div>
                   <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Latency</p>
                   <p className="text-2xl font-black text-emerald-400">24ms</p>
                </div>
                <div className="w-px h-10 bg-white/10 self-center"></div>
                <div>
                   <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Sync Rate</p>
                   <p className="text-2xl font-black text-indigo-400">100%</p>
                </div>
             </div>
             <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]"></div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;