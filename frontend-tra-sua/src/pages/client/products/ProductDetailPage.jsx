import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedToppings, setSelectedToppings] = useState([]);

  // 🚀 HỆ THỐNG TOAST UI (MỚI)
  const [notifies, setNotifies] = useState([]);
  const showToast = (msg, type = 'success') => {
    const toastId = Date.now();
    setNotifies(prev => [...prev, { id: toastId, msg, type }]);
    setTimeout(() => {
      setNotifies(prev => prev.filter(n => n.id !== toastId));
    }, 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/Products`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/Toppings`)
        ]);

        const currentProduct = pRes.data.find(p => p.id === parseInt(id));
        setProduct(currentProduct);
        setToppings(tRes.data.filter(x => x.isActive));
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf7]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-xl font-medium text-gray-600">Đang chuẩn bị món ngon cho sếp...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-light text-gray-500 bg-[#fdfaf7]">
        Món này hiện không tồn tại hoặc đã hết hàng.
      </div>
    );
  }

  const calculatePrice = () => {
    let price = product.basePrice || 0;
    if (product.hasOptions) {
      if (selectedSize === 'L') price += product.sizeUpPrice || 0;
      if (selectedSize === 'XL') price += product.sizeXlPrice || 0;
      
      selectedToppings.forEach(tId => {
        const topping = toppings.find(t => t.id === tId);
        if (topping) price += topping.price || 0;
      });
    }
    return price;
  };

  const handleAddToCart = () => {
    const item = {
      cartId: Date.now(),
      productId: product.id,
      productName: product.productName,
      imageUrl: product.imageUrl,
      size: product.hasOptions ? selectedSize : 'Mặc định',
      toppingIds: product.hasOptions ? selectedToppings : [],
      toppingNames: product.hasOptions 
        ? selectedToppings.map(tId => toppings.find(t => t.id === tId)?.toppingName || '').join(', ')
        : '',
      unitPrice: calculatePrice(),
      quantity: 1
    };

    const cart = JSON.parse(localStorage.getItem('hieu_cart') || '[]');
    localStorage.setItem('hieu_cart', JSON.stringify([...cart, item]));

    const channel = new BroadcastChannel('hieu_cart_channel');
    channel.postMessage('updated');
    channel.close();

    showToast(`✅ Đã thêm "${product.productName}" vào giỏ hàng!`, 'success');
    
    // Đợi 1 giây cho Toast bay ra cho đẹp rồi mới nhảy sang giỏ hàng
    setTimeout(() => {
        navigate('/cart');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#fdfaf7] pb-[150px] relative">
      
      {/* 🚀 TOAST CONTAINER */}
      <div className="fixed top-10 right-10 z-[300] flex flex-col gap-2">
        {notifies.map(n => (
          <div key={n.id} className={`px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] shadow-2xl animate-slideInRight tracking-widest border-2 flex items-center gap-3 ${
            n.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
          }`}>
            {n.msg}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-3 text-gray-500 hover:text-gray-900 transition-colors mb-10 group"
        >
          <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
          <span className="font-bold uppercase tracking-widest text-xs">Quay lại thực đơn</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
          <div className="relative">
            <div className="sticky top-28 bg-white rounded-[3.5rem] overflow-hidden shadow-2xl border border-gray-100 p-10">
              <img 
                src={`${import.meta.env.VITE_API_URL}${product.imageUrl}`} 
                alt={product.productName}
                className="w-full h-full object-contain drop-shadow-xl transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-10">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-full text-[10px] font-black tracking-[3px] uppercase">
                {product.hasOptions ? "Signature Drink" : "Snack Thời Thượng"}
              </span>
              <h1 className="text-5xl lg:text-6xl font-black tracking-tighter mt-6 leading-tight text-gray-900">
                {product.productName}
              </h1>
              <p className="mt-6 text-lg text-gray-500 font-medium leading-relaxed">
                {product.description || "Hương vị đặc trưng chỉ có tại HieuStore – nguyên liệu tuyển chọn, chất lượng tuyệt hảo."}
              </p>
            </div>

            {product.hasOptions && (
              <>
                <div className="mb-12 animate-fadeIn">
                  <h3 className="uppercase text-[10px] font-black tracking-[3px] text-gray-400 mb-5 flex items-center gap-3">
                    <span className="text-xl">📏</span> CHỌN KÍCH CỠ LY
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {['M', 'L', 'XL'].map(size => {
                      const available = size === 'M' || 
                        (size === 'L' && product.sizeUpPrice > 0) || 
                        (size === 'XL' && product.sizeXlPrice > 0);
                      if (!available) return null;

                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`py-6 rounded-[2rem] font-black text-lg border-2 transition-all duration-300 ${
                            selectedSize === size 
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-[1.03]' 
                              : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          Size {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="animate-fadeIn">
                  <h3 className="uppercase text-[10px] font-black tracking-[3px] text-gray-400 mb-5 flex items-center gap-3">
                    <span className="text-xl">🍓</span> THÊM TOPPING XỊN
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                    {toppings.map(t => (
                      <label 
                        key={t.id}
                        className={`flex items-center justify-between p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 ${
                          selectedToppings.includes(t.id) 
                            ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                            : 'border-gray-100 hover:border-gray-200 hover:bg-white'
                        }`}
                      >
                        <div>
                          <div className="font-black text-gray-800 text-sm">{t.toppingName}</div>
                          <div className="text-indigo-600 text-[10px] font-black tracking-widest uppercase mt-1">
                            +{t.price.toLocaleString()}đ
                          </div>
                        </div>
                        <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                          selectedToppings.includes(t.id) 
                            ? 'bg-indigo-600 border-indigo-600' 
                            : 'border-gray-200 bg-white'
                        }`}>
                          {selectedToppings.includes(t.id) && <span className="text-white text-sm font-black">✓</span>}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={selectedToppings.includes(t.id)}
                          onChange={() => {
                            setSelectedToppings(prev =>
                              prev.includes(t.id)
                                ? prev.filter(id => id !== t.id)
                                : [...prev, t.id]
                            );
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[3px] font-black text-gray-400 mb-1">Tổng tiền món này</p>
            <p className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
              {calculatePrice().toLocaleString()}đ
            </p>
          </div>

          <button 
            onClick={handleAddToCart}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-16 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 active:scale-95 transition-all duration-300"
          >
            THÊM VÀO GIỎ HÀNG 🛒
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;