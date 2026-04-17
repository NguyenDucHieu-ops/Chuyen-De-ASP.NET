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
          <p className="mt-6 text-xl font-medium text-gray-600">Đang pha chế món yêu thích của bạn...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-light text-gray-500">
        Món này hiện không tồn tại hoặc đã hết hàng.
      </div>
    );
  }

  const calculatePrice = () => {
    let price = product.basePrice || 0;
    if (selectedSize === 'L') price += product.sizeUpPrice || 0;
    if (selectedSize === 'XL') price += product.sizeXlPrice || 0;
    selectedToppings.forEach(tId => {
      const topping = toppings.find(t => t.id === tId);
      if (topping) price += topping.price || 0;
    });
    return price;
  };

  const handleAddToCart = () => {
    const item = {
      cartId: Date.now(),
      productId: product.id,
      productName: product.productName,
      imageUrl: product.imageUrl,
      size: selectedSize,
      toppingIds: selectedToppings,
      toppingNames: selectedToppings.map(tId => 
        toppings.find(t => t.id === tId)?.toppingName || ''
      ).join(', '),
      unitPrice: calculatePrice(),
      quantity: 1
    };

    const cart = JSON.parse(localStorage.getItem('hieu_cart') || '[]');
    localStorage.setItem('hieu_cart', JSON.stringify([...cart, item]));

    const channel = new BroadcastChannel('hieu_cart_channel');
    channel.postMessage('updated');
    channel.close();

    alert(`✅ Đã thêm "${product.productName}" (${selectedSize}) vào giỏ hàng!`);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-[#fdfaf7] pb-32">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-3 text-gray-500 hover:text-gray-900 transition-colors mb-10 group"
        >
          <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
          <span className="font-medium">Quay lại thực đơn</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
          {/* LEFT - IMAGE */}
          <div className="relative">
            <div className="sticky top-28 bg-white rounded-[3.5rem] overflow-hidden shadow-2xl border border-gray-100 p-10">
              <img 
                src={`${import.meta.env.VITE_API_URL}${product.imageUrl}`} 
                alt={product.productName}
                className="w-full h-full object-contain drop-shadow-xl transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          {/* RIGHT - DETAILS */}
          <div className="flex flex-col">
            <div className="mb-10">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-full text-xs font-black tracking-[2px]">
                SIGNATURE DRINK
              </span>
              <h1 className="text-6xl font-black tracking-tighter mt-6 leading-none text-gray-900">
                {product.productName}
              </h1>
              <p className="mt-8 text-lg text-gray-600 leading-relaxed">
                {product.description || "Hương vị đặc trưng chỉ có tại HieuStore – được pha chế thủ công từ những nguyên liệu tươi ngon nhất."}
              </p>
            </div>

            {/* SIZE SELECTION */}
            <div className="mb-12">
              <h3 className="uppercase text-xs font-bold tracking-[2px] text-gray-500 mb-5 flex items-center gap-3">
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
                      className={`py-7 rounded-3xl font-bold text-lg border-2 transition-all duration-300 ${
                        selectedSize === size 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xl scale-[1.03]' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Size {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TOPPINGS */}
            <div>
              <h3 className="uppercase text-xs font-bold tracking-[2px] text-gray-500 mb-5 flex items-center gap-3">
                <span className="text-xl">🍓</span> THÊM TOPPING XỊN
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-3 custom-scrollbar">
                {toppings.map(t => (
                  <label 
                    key={t.id}
                    className={`flex items-center justify-between p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedToppings.includes(t.id) 
                        ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                        : 'border-gray-100 hover:border-gray-200 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-gray-800">{t.toppingName}</div>
                      <div className="text-emerald-600 text-sm font-medium mt-1">
                        +{t.price.toLocaleString()}đ
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-2xl border-2 flex items-center justify-center transition-all ${
                      selectedToppings.includes(t.id) 
                        ? 'bg-indigo-600 border-indigo-600' 
                        : 'border-gray-300 bg-white'
                    }`}>
                      {selectedToppings.includes(t.id) && <span className="text-white text-lg leading-none">✓</span>}
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
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM BAR - Rất chuyên nghiệp */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-gray-400">Tổng tiền món này</p>
            <p className="text-5xl font-black text-gray-900 tracking-tighter mt-1">
              {calculatePrice().toLocaleString()}đ
            </p>
          </div>

          <button 
            onClick={handleAddToCart}
            className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-20 py-7 rounded-3xl font-bold text-lg tracking-widest shadow-2xl active:scale-95 transition-all duration-300"
          >
            THÊM VÀO GIỎ HÀNG
          </button>
        </div>
      </div>

      {/* Padding cho sticky bar */}
      <div className="h-28"></div>
    </div>
  );
};

export default ProductDetailPage;