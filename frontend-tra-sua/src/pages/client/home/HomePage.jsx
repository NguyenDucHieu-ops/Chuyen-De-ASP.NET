import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/Products`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Categories`)
        ]);

        setProducts(pRes.data.filter(x => x.isActive));
        setCategories(cRes.data.filter(x => x.isActive));
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-28 pb-16">
      {/* HERO SECTION - Premium & Eye-catching */}
      <div className="relative h-[620px] rounded-[3.5rem] overflow-hidden shadow-2xl bg-zinc-950 group">
        <img 
          src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=2000&q=95" 
          className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-[5000ms] ease-out" 
          alt="HieuStore Signature" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/40 to-transparent" />
        
        <div className="absolute bottom-24 left-10 md:left-20 z-20 max-w-2xl text-white">
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-xl px-8 py-3 rounded-3xl text-xs font-bold tracking-[3px] border border-white/30 shadow-inner">
            SIGNATURE COLLECTION 2026
          </div>
          
          <h1 className="text-7xl md:text-[100px] font-black italic tracking-[-5px] leading-[0.95] mt-8 mb-6">
            Trà sữa<br />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">thật sự khác biệt</span>
          </h1>
          
          <p className="text-2xl text-white/80 max-w-lg font-light tracking-tight">
            Nguyên liệu tươi mỗi ngày • Topping thủ công • Hương vị dành riêng cho bạn.
          </p>
        </div>
      </div>

      {/* TABS DANH MỤC - Mượt & Hiện đại */}
      <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar px-2 -mx-2">
        <button 
          onClick={() => setActiveTab(0)}
          className={`px-12 py-5 rounded-3xl font-bold whitespace-nowrap transition-all duration-300 text-sm tracking-widest ${
            activeTab === 0 
              ? 'bg-zinc-900 text-white shadow-2xl scale-105' 
              : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:shadow'
          }`}
        >
          TẤT CẢ
        </button>
        
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-12 py-5 rounded-3xl font-bold whitespace-nowrap transition-all duration-300 text-sm tracking-widest ${
              activeTab === cat.id 
                ? 'bg-indigo-600 text-white shadow-2xl scale-105' 
                : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:shadow'
            }`}
          >
            {cat.categoryName.toUpperCase()}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse">
              <div className="aspect-square bg-gray-100" />
              <div className="p-8 space-y-5">
                <div className="h-8 bg-gray-100 rounded-2xl w-11/12" />
                <div className="h-6 bg-gray-100 rounded-xl w-1/2" />
              </div>
            </div>
          ))
        ) : (
          products
            .filter(p => activeTab === 0 || p.categoryId === activeTab)
            .map((p, index) => (
              <div 
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-6 active:scale-[0.985] transition-all duration-500 cursor-pointer relative"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img 
                    src={`${import.meta.env.VITE_API_URL}${p.imageUrl}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={p.productName} 
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Quick View Badge */}
                  <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md text-xs font-bold px-5 py-2.5 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
                    Xem chi tiết
                  </div>

                  {/* Badge */}
                  {(index % 4 === 0) && (
                    <div className="absolute top-6 left-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-2xl shadow">
                      BEST SELLER
                    </div>
                  )}
                </div>

                <div className="p-8">
                  <h3 className="font-black text-[22px] tracking-tighter leading-tight line-clamp-2 text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">
                    {p.productName}
                  </h3>
                  
                  <div className="mt-6 flex justify-between items-end">
                    <div>
                      <span className="text-4xl font-black text-indigo-600 tracking-tighter">
                        {p.basePrice?.toLocaleString()}đ
                      </span>
                      <span className="block text-xs text-gray-400 mt-1">Size M trở lên</span>
                    </div>
                    
                    {/* Fake Rating */}
                    <div className="flex items-center gap-1 text-amber-400">
                      ★★★★☆
                      <span className="text-xs text-gray-400 ml-1">(4.8)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default HomePage;