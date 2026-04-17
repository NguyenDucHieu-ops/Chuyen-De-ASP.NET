import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState(''); // State cho thanh tìm kiếm
  
  const navigate = useNavigate();

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

  // Hàm lọc sản phẩm theo Category và Tìm kiếm
  const filteredProducts = products.filter(p => {
    const matchCategory = activeTab === 0 || p.categoryId === activeTab;
    const matchSearch = p.productName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-[fadeIn_0.5s_ease-out]">
      
      {/* HEADER & TÌM KIẾM */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-indigo-50 p-8 md:p-12 rounded-[3rem]">
        <div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-indigo-900 mb-4">
            Thực Đơn
          </h1>
          <p className="text-indigo-600/80 text-lg font-medium">Khám phá thế giới hương vị của HieuStore</p>
        </div>
        
        <div className="w-full md:w-96 relative">
          <input 
            type="text" 
            placeholder="Tìm món bạn yêu thích..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-6 pr-14 py-5 rounded-full border-none shadow-xl focus:ring-4 focus:ring-indigo-200 outline-none transition-all font-medium text-gray-700 bg-white"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md">
            🔍
          </div>
        </div>
      </div>

      {/* TABS DANH MỤC */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-1">
        <button 
          onClick={() => setActiveTab(0)}
          className={`px-8 py-3 rounded-2xl font-bold whitespace-nowrap transition-all duration-300 ${activeTab === 0 
            ? 'bg-zinc-900 text-white shadow-xl scale-105' 
            : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
        >
          TẤT CẢ TẠI HIEUSTORE
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-8 py-3 rounded-2xl font-bold whitespace-nowrap transition-all duration-300 ${activeTab === cat.id 
              ? 'bg-indigo-600 text-white shadow-xl scale-105' 
              : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
          >
            {cat.categoryName.toUpperCase()}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse border border-gray-100">
              <div className="aspect-square bg-gray-100" />
              <div className="p-6 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem]">
          <span className="text-6xl mb-4 block">🧋</span>
          <h3 className="text-2xl font-bold text-gray-800">Không tìm thấy món nào!</h3>
          <p className="text-gray-500 mt-2">Thử tìm kiếm với một từ khóa khác xem sao nhé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(p => (
            <div 
              key={p.id}
              onClick={() => navigate(`/product/${p.id}`)}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-50 p-4">
                <img 
                  src={`${import.meta.env.VITE_API_URL}${p.imageUrl}`} 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-md" 
                  alt={p.productName} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[80%] bg-white/95 backdrop-blur-sm text-center py-3 rounded-xl font-bold text-indigo-600 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                  Xem & Đặt Món
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between bg-white z-10">
                <h3 className="font-bold text-xl tracking-tight line-clamp-2 text-gray-800 group-hover:text-indigo-600 transition-colors">{p.productName}</h3>
                <div className="mt-4 flex justify-between items-end">
                  <span className="text-2xl font-black text-indigo-600 tracking-tighter">
                    {p.basePrice?.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;