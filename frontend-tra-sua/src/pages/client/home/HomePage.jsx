import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // LOGIC CUSTOM MÓN
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [picking, setPicking] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedToppings, setSelectedToppings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, c, t] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/Products`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Categories`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Toppings`)
        ]);
        setProducts(p.data.filter(x => x.isActive));
        setCategories(c.data.filter(x => x.isActive));
        setToppings(t.data.filter(x => x.isActive));
      } catch (err) { console.error("API Error:", err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const calculatePrice = () => {
    if (!picking) return 0;
    let price = picking.basePrice;
    if (selectedSize === 'L') price += picking.sizeUpPrice;
    if (selectedSize === 'XL') price += picking.sizeXlPrice;
    selectedToppings.forEach(id => {
      price += toppings.find(t => t.id === id)?.price || 0;
    });
    return price;
  };

  const handleAddToCart = () => {
    const item = {
      cartId: Date.now(),
      productId: picking.id,
      productName: picking.productName,
      imageUrl: picking.imageUrl,
      size: selectedSize,
      toppingIds: selectedToppings,
      toppingNames: selectedToppings.map(id => toppings.find(x => x.id === id).toppingName).join(', '),
      unitPrice: calculatePrice(),
      quantity: 1
    };
    const cart = JSON.parse(localStorage.getItem('hieu_cart') || '[]');
    localStorage.setItem('hieu_cart', JSON.stringify([...cart, item]));
    setIsModalOpen(false);
    window.dispatchEvent(new Event("storage"));
    alert(`Đã thêm món vào giỏ hàng! 🥤`);
  };

  return (
    <div className="space-y-16">
      {/* 🚀 HERO SECTION NGHỆ THUẬT */}
      <div className="relative h-[500px] rounded-[4rem] overflow-hidden shadow-3xl bg-indigo-900 group">
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-900/60 to-transparent z-10"></div>
         <img src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]" alt="Hero" />
         <div className="absolute bottom-20 left-16 z-20 text-white">
            <span className="bg-indigo-600/30 backdrop-blur px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-400">Exclusive Menu</span>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter mt-8 mb-4 leading-[0.9]">Hieu Store <br/> <span className="text-yellow-400">Signature.</span></h1>
            <p className="text-gray-300 font-bold max-w-md italic">Sự kết hợp hoàn hảo giữa trà hảo hạng và topping nhà làm độc quyền.</p>
         </div>
      </div>

      {/* 🥤 TABS DANH MỤC DẠNG PILL */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-2">
        <button onClick={() => setActiveTab(0)} className={`px-12 py-5 rounded-[2rem] font-black transition-all duration-500 shadow-sm ${activeTab === 0 ? 'bg-gray-900 text-white shadow-2xl scale-105' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}>TẤT CẢ</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setActiveTab(c.id)} className={`px-12 py-5 rounded-[2rem] font-black whitespace-nowrap transition-all duration-500 ${activeTab === c.id ? 'bg-indigo-600 text-white shadow-2xl scale-105' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}>{c.categoryName.toUpperCase()}</button>
        ))}
      </div>

      {/* 🛒 DANH SÁCH SẢN PHẨM PHONG CÁCH "MODERN CARDS" */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {loading ? [...Array(8)].map((_, i) => <div key={i} className="h-80 bg-gray-100 rounded-[3rem] animate-pulse"></div>) : 
          products.filter(p => activeTab === 0 || p.categoryId === activeTab).map(p => (
            <div key={p.id} onClick={() => { setPicking(p); setSelectedSize('M'); setSelectedToppings([]); setIsModalOpen(true); }}
                 className="group bg-white p-6 rounded-[3rem] border border-gray-50 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-4 transition-all duration-500 cursor-pointer relative overflow-hidden">
               <div className="aspect-square rounded-[2.5rem] overflow-hidden mb-6 bg-gray-50 relative shadow-inner">
                  <img src={`${import.meta.env.VITE_API_URL}${p.imageUrl}`} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" alt="Drink" />
                  <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/20 transition-colors"></div>
                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-2xl opacity-0 translate-y-10 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">+</div>
               </div>
               <div className="px-2">
                  <h3 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter mb-2 line-clamp-1">{p.productName}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-black text-indigo-600">{p.basePrice?.toLocaleString()}đ</span>
                    <div className="flex gap-1">
                       <span className="w-4 h-4 bg-gray-100 rounded-full border border-gray-200"></span>
                       <span className="w-4 h-4 bg-indigo-100 rounded-full border border-indigo-200"></span>
                    </div>
                  </div>
               </div>
            </div>
          ))
        }
      </div>

      {/* 🎩 MODAL TÙY CHỈNH (PICK MÓN) - KHÔNG CÒN LỖI SIZE */}
      {isModalOpen && picking && (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 shadow-3xl animate-slideUp relative overflow-hidden">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-12 text-5xl font-black text-gray-200 hover:text-rose-500 transition-colors">×</button>
            
            <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-gray-50 bg-gray-50">
               <img src={`${import.meta.env.VITE_API_URL}${picking.imageUrl}`} className="w-full h-full object-cover" alt="Pick" />
            </div>
            
            <div className="flex flex-col h-full py-6">
              <span className="text-indigo-600 font-black uppercase text-[10px] tracking-[0.4em] mb-4">HieuStore Specialty</span>
              <h2 className="text-5xl font-black text-gray-800 italic uppercase tracking-tighter mb-4 leading-none">{picking.productName}</h2>
              <p className="text-gray-400 font-medium italic mb-10 text-lg">"{picking.description || 'Chút hương vị ngọt ngào từ những nguyên liệu chọn lọc nhất.'}"</p>

              {/* 1. SIZE SELECTION */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black italic">S</div>
                   <h4 className="text-xs font-black uppercase tracking-widest text-gray-800">Chọn kích cỡ ly</h4>
                </div>
                <div className="flex gap-4">
                  {['M', 'L', 'XL'].map(size => {
                    const isAvail = size === 'M' || (size === 'L' && picking.sizeUpPrice > 0) || (size === 'XL' && picking.sizeXlPrice > 0);
                    if (!isAvail) return null;
                    return (
                      <button key={size} onClick={() => setSelectedSize(size)} 
                        className={`flex-1 py-5 rounded-3xl font-black transition-all duration-300 border-2 ${selectedSize === size ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-xl scale-105' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}>
                        Size {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. TOPPING SELECTION */}
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black italic">T</div>
                   <h4 className="text-xs font-black uppercase tracking-widest text-gray-800">Thêm topping xịn</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 max-h-56 overflow-y-auto pr-4 custom-scrollbar">
                  {toppings.map(t => (
                    <label key={t.id} className={`flex items-center justify-between p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${selectedToppings.includes(t.id) ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-50 hover:bg-white hover:border-gray-200'}`}>
                      <input type="checkbox" className="hidden" checked={selectedToppings.includes(t.id)} onChange={() => selectedToppings.includes(t.id) ? setSelectedToppings(selectedToppings.filter(id => id !== t.id)) : setSelectedToppings([...selectedToppings, t.id])} />
                      <div className="flex flex-col">
                         <span className="text-sm font-black text-gray-700">{t.toppingName}</span>
                         <span className="text-[10px] font-bold text-indigo-500 mt-1">+{t.price?.toLocaleString()}đ</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedToppings.includes(t.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-200'}`}>
                         {selectedToppings.includes(t.id) && <span className="text-white text-[10px]">✓</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. PRICE & CTA */}
              <div className="mt-12 pt-10 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng thanh toán món</p>
                  <p className="text-5xl font-black text-gray-900 tracking-tighter">{calculatePrice().toLocaleString()}đ</p>
                </div>
                <button onClick={handleAddToCart} className="bg-indigo-600 text-white px-16 py-6 rounded-[2.5rem] font-black shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-700 hover:-translate-y-2 transition-all uppercase tracking-[0.2em] text-xs">Thêm Giỏ Hàng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;