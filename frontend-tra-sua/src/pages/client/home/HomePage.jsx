import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [articles, setArticles] = useState([]); // 👈 State mới cho bài viết
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes, bRes, aRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/Products`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Categories`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Banners`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Articles`) // 👈 Fetch bài viết
        ]);

        setProducts(pRes.data.filter(x => x.isActive));
        setCategories(cRes.data.filter(x => x.isActive));
        setBanners(bRes.data.filter(x => x.isActive));
        setArticles(aRes.data.slice(0, 3)); // Lấy 3 bài mới nhất thôi cho đẹp
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners]);

  return (
    <div className="space-y-28 pb-16">
      
      {/* 🚀 PREMIUM BANNER SLIDER (GIỮ NGUYÊN) */}
      <div className="relative h-[450px] md:h-[600px] rounded-[3.5rem] overflow-hidden shadow-2xl bg-zinc-950 group">
        {banners.length > 0 ? (
          banners.map((banner, index) => (
            <div key={banner.id} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentBanner ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
              <img src={`${import.meta.env.VITE_API_URL}${banner.imageUrl}`} className="w-full h-full object-cover" alt={banner.title} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-20 left-10 md:left-20 z-20 max-w-2xl text-white animate-fadeIn">
                <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-xl px-8 py-3 rounded-3xl text-[10px] font-black tracking-[4px] border border-white/20 shadow-inner mb-6">EXCLUSIVE OFFER</div>
                <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-[0.9] mb-8 uppercase drop-shadow-2xl">{banner.title}</h2>
                <button onClick={() => navigate(banner.linkUrl || '/products')} className="bg-white text-black px-12 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[3px] hover:bg-indigo-600 hover:text-white transition-all shadow-2xl">Khám phá ngay →</button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-white/20 font-black text-2xl uppercase italic">HieuStore Signature Loading...</div>
        )}
        
        <div className="absolute bottom-10 right-20 flex gap-3 z-30">
          {banners.map((_, i) => (
            <div key={i} className={`h-1.5 transition-all duration-500 rounded-full ${i === currentBanner ? 'w-12 bg-white' : 'w-3 bg-white/30'}`} />
          ))}
        </div>
      </div>

      {/* TABS DANH MỤC (GIỮ NGUYÊN) */}
      <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar px-2 -mx-2">
        <button onClick={() => setActiveTab(0)} className={`px-12 py-5 rounded-3xl font-bold whitespace-nowrap transition-all duration-300 text-sm tracking-widest ${activeTab === 0 ? 'bg-zinc-900 text-white shadow-2xl scale-105' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}>TẤT CẢ</button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveTab(cat.id)} className={`px-12 py-5 rounded-3xl font-bold whitespace-nowrap transition-all duration-300 text-sm tracking-widest ${activeTab === cat.id ? 'bg-indigo-600 text-white shadow-2xl scale-105' : 'bg-white border border-gray-100 text-gray-500'}`}>{cat.categoryName.toUpperCase()}</button>
        ))}
      </div>

      {/* PRODUCT GRID - THÊM NÚT GIỎ HÀNG KHI HOVER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-white rounded-3xl aspect-[3/4] animate-pulse" />)
        ) : (
          products.filter(p => activeTab === 0 || p.categoryId === activeTab).map((p, index) => (
            <div key={p.id} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-6 transition-all duration-500 cursor-pointer relative">
              <div onClick={() => navigate(`/product/${p.id}`)} className="relative aspect-square overflow-hidden bg-gray-50">
                <img src={`${import.meta.env.VITE_API_URL}${p.imageUrl}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.productName} />
                {(index % 4 === 0) && <div className="absolute top-6 left-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-2xl shadow">BEST SELLER</div>}
                
                {/* 🛒 NÚT GIỎ HÀNG XUẤT HIỆN KHI HOVER */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/product/${p.id}`); }}
                    className="bg-white text-gray-900 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-2xl hover:bg-indigo-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500"
                  >
                    + THÊM GIỎ HÀNG
                  </button>
                </div>
              </div>

              <div className="p-8" onClick={() => navigate(`/product/${p.id}`)}>
                <h3 className="font-black text-[22px] tracking-tighter leading-tight line-clamp-2 text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">{p.productName}</h3>
                <div className="mt-6 flex justify-between items-end">
                  <div>
                    <span className="text-4xl font-black text-indigo-600 tracking-tighter">{p.basePrice?.toLocaleString()}đ</span>
                    <span className="block text-xs text-gray-400 mt-1">Size M tiêu chuẩn</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">★★★★☆<span className="text-xs text-gray-400 ml-1">(4.8)</span></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 📰 SECTION BÀI VIẾT - ĐẶC SẮC DƯỚI CÙNG */}
      <div className="space-y-12">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter">Góc <span className="text-blue-600">Tin Tức</span></h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 ml-1 italic">Khám phá văn hóa trà sữa cùng HieuStore</p>
          </div>
          <button onClick={() => navigate('/articles')} className="text-[10px] font-black uppercase tracking-[3px] border-b-2 border-gray-900 pb-1 hover:text-blue-600 hover:border-blue-600 transition-all">Xem tất cả</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {articles.map(art => (
            <div key={art.id} onClick={() => navigate(`/article/${art.id}`)} className="group cursor-pointer">
              <div className="relative aspect-video rounded-[2.5rem] overflow-hidden mb-6 shadow-lg">
                <img src={`${import.meta.env.VITE_API_URL}${art.thumbnail}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="news" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-3">
                <span className="text-blue-600 font-black text-[10px] uppercase tracking-widest italic">{new Date(art.createdAt).toLocaleDateString()}</span>
                <h3 className="text-2xl font-black tracking-tight leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors uppercase italic">{art.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 font-medium">Tìm hiểu những bí mật đằng sau hương vị trà sữa đặc trưng và các tin tức khuyến mãi mới nhất từ HieuStore.</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HomePage;