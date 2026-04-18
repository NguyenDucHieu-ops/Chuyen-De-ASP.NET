import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [articles, setArticles] = useState([]); 
  const [reviews, setReviews] = useState([]);
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
          axios.get(`${import.meta.env.VITE_API_URL}/api/Articles`)
        ]);

        setProducts(pRes.data.filter(x => x.isActive));
        setCategories(cRes.data.filter(x => x.isActive));
        setBanners(bRes.data.filter(x => x.isActive));
        setArticles(aRes.data.slice(0, 3)); 
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const rRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/Reviews`);
        const goodReviews = rRes.data.filter(r => r.rating >= 4).slice(0, 6);
        setReviews(goodReviews);
      } catch (err) {
        console.log("Chưa public API Đánh giá hoặc không có dữ liệu:", err);
      }
    };

    fetchData();
    fetchReviews();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners]);

  const newArrivals = [...products].reverse().slice(0, 4);

  return (
    <div className="space-y-28 pb-16 animate-[fadeIn_0.5s_ease-out]">
      
      {/* 🚀 PREMIUM BANNER SLIDER */}
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

      {/* 🆕 SECTION: SẢN PHẨM MỚI LÊN KỆ */}
      {!loading && newArrivals.length > 0 && (
        <div className="space-y-12">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Món Mới <span className="text-blue-600">Lên Kệ</span> 🔥</h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2 ml-1 italic">Những hương vị vừa được ra mắt</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map((p) => (
              <div key={`new-${p.id}`} className="group bg-blue-50/30 rounded-3xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 cursor-pointer relative" onClick={() => navigate(`/product/${p.id}`)}>
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img src={`${import.meta.env.VITE_API_URL}${p.imageUrl}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.productName} />
                  <div className="absolute top-4 right-4 bg-blue-600 text-white text-[9px] font-black tracking-widest px-4 py-2 rounded-2xl shadow-xl animate-pulse">NEW</div>
                </div>
                <div className="p-6">
                  <h3 className="font-black text-lg tracking-tighter leading-tight line-clamp-1 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{p.productName}</h3>
                  <div className="mt-4 flex justify-between items-end">
                    <span className="text-2xl font-black text-blue-600 tracking-tighter">{p.basePrice?.toLocaleString()}đ</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TABS DANH MỤC */}
      <div className="space-y-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Menu <span className="text-blue-600">HieuStore</span> 🥤</h2>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-2 -mx-2">
          <button onClick={() => setActiveTab(0)} className={`px-12 py-5 rounded-3xl font-bold whitespace-nowrap transition-all duration-300 text-sm tracking-widest ${activeTab === 0 ? 'bg-zinc-900 text-white shadow-2xl scale-105' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}>TẤT CẢ</button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveTab(cat.id)} className={`px-12 py-5 rounded-3xl font-bold whitespace-nowrap transition-all duration-300 text-sm tracking-widest ${activeTab === cat.id ? 'bg-indigo-600 text-white shadow-2xl scale-105' : 'bg-white border border-gray-100 text-gray-500'}`}>{cat.categoryName.toUpperCase()}</button>
          ))}
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-white rounded-3xl aspect-[3/4] animate-pulse" />)
          ) : (
            products.filter(p => activeTab === 0 || p.categoryId === activeTab).map((p, index) => (
              <div key={p.id} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-6 transition-all duration-500 cursor-pointer relative">
                <div onClick={() => navigate(`/product/${p.id}`)} className="relative aspect-square overflow-hidden bg-gray-50">
                  <img src={`${import.meta.env.VITE_API_URL}${p.imageUrl}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.productName} />
                  {(index % 4 === 0) && <div className="absolute top-6 left-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-2xl shadow">BEST SELLER</div>}
                  
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
      </div>

      {/* 💬 SECTION: ĐÁNH GIÁ TỪ KHÁCH HÀNG */}
      {!loading && reviews.length > 0 && (
        <div className="space-y-12 bg-gray-900 -mx-4 px-4 md:-mx-8 md:px-8 py-20 rounded-[3.5rem] shadow-inner text-white">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Khách Hàng <span className="text-amber-400">Đánh Giá</span> 💖</h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2 ml-1 italic">Những lời khen chân thực nhất</p>
            </div>
            {/* 💡 NÚT XEM TẤT CẢ */}
            <button onClick={() => navigate('/reviews')} className="text-[10px] font-black uppercase tracking-[3px] border-b-2 border-white pb-1 hover:text-amber-400 hover:border-amber-400 transition-all">Xem tất cả</button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar">
            {reviews.map(r => (
              <div key={`rev-${r.id}`} className="min-w-[320px] md:min-w-[450px] bg-white text-gray-900 p-8 rounded-[3rem] snap-start shrink-0 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                      {r.user?.fullName?.charAt(0) || "K"}
                    </div>
                    <div>
                      <h4 className="font-black text-lg uppercase tracking-tight">{r.user?.fullName || "Khách Hàng"}</h4>
                      <div className="flex text-amber-400 text-[10px] mt-1">
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                      </div>
                    </div>
                    {/* 💡 THỂ HIỆN TÊN MÓN ĂN Ở GÓC PHẢI */}
                    <span className="ml-auto bg-gray-100 text-gray-500 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest truncate max-w-[120px]">
                      {r.productName}
                    </span>
                  </div>
                  <p className="text-gray-600 font-bold italic mb-6 text-sm leading-relaxed line-clamp-3">"{r.comment}"</p>
                  
                  {r.reviewImages && r.reviewImages.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-4">
                      {r.reviewImages.map((img, i) => (
                        <img key={i} src={`${import.meta.env.VITE_API_URL}${img.imageUrl}`} className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100 shadow-sm shrink-0" alt="review" />
                      ))}
                    </div>
                  )}

                  {/* 💡 PHẦN PHẢN HỒI CỦA ADMIN MÀU XANH TRÊN TRANG CHỦ */}
                  {r.adminReply && (
                    <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-100 mb-4">
                      <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">👑 Quán phản hồi</p>
                      <p className="text-gray-700 font-medium text-xs">"{r.adminReply}"</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                  <span>Mã đơn: #{r.orderId}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📰 SECTION BÀI VIẾT */}
      <div className="space-y-12 pt-8">
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