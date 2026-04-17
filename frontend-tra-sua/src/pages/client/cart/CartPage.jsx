import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const CartPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('hieu_store_token');
  
  // Dữ liệu giỏ hàng
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('hieu_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Trạng thái Voucher (Đã thêm vào JSX để hết gạch đỏ 🚀)
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [note, setNote] = useState('');

  // Quản lý địa chỉ & Thanh toán
  const [addresses, setAddresses] = useState([]); 
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [manualAddress, setManualAddress] = useState(''); 
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD'); 

  // 1. Lấy địa chỉ từ Server
  useEffect(() => {
    if (token) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/UserAddresses`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setAddresses(res.data);
        // Nếu có địa chỉ trong DB, ưu tiên lấy cái mặc định hoặc cái đầu tiên
        if (res.data.length > 0) {
          const defaultAddr = res.data.find(a => a.isDefault) || res.data[0];
          setSelectedAddressId(defaultAddr.id);
          setIsAddressConfirmed(true);
        }
      })
      .catch(() => console.log("Hiếu ơi, chưa có địa chỉ nào trong DB đâu!"));
    }
  }, [token]);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('hieu_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const updateQuantity = (cartId, delta) => {
    const newCart = cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveCart(newCart);
  };

  const removeFromCart = (cartId) => {
    if (window.confirm("Bỏ món này nha?")) {
      const newCart = cart.filter(item => item.cartId !== cartId);
      saveCart(newCart);
    }
  };

  const subtotal = cart.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);

  // 2. Logic Voucher (Sử dụng biến để hết báo lỗi đỏ)
  const applyVoucher = async () => {
    if (!voucherCode) return;
    setIsApplying(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Vouchers`);
      const v = res.data.find(x => x.code === voucherCode.toUpperCase() && x.isActive);
      if (v) {
        setDiscount(v.discountAmount);
        alert(`Ngon! Giảm ngay ${v.discountAmount.toLocaleString()}đ 🔥`);
      } else {
        alert("Mã này lỏ rồi Hiếu ơi!");
        setDiscount(0);
      }
    } catch {
      alert("Lỗi server voucher!");
    } finally {
      setIsApplying(false);
    }
  };

  // 3. Logic Checkout (Sửa lỗi 400)
  const handleCheckout = async () => {
    if (!token) { alert("Đăng nhập đã!"); navigate('/login'); return; }
    if (cart.length === 0) return;
    if (!isAddressConfirmed && !manualAddress) { alert("Nhập địa chỉ đã!"); return; }

    const finalAddressStr = isAddressConfirmed 
      ? (addresses.find(a => a.id === selectedAddressId)?.detailedAddress || manualAddress)
      : manualAddress;

    const orderData = {
      // 💡 LƯU Ý: Nếu selectedAddressId vẫn null, dùng 1. 
      // Nhưng Hiếu phải chắc chắn UserId 1 là của bạn!
      addressId: selectedAddressId || 1, 
      voucherCode: discount > 0 ? voucherCode : null,
      note: `[ĐỊA CHỈ: ${finalAddressStr}] - ${note}`,
      items: cart.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        size: i.size,
        toppingIds: i.toppingIds
      }))
    };

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/Orders/checkout`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (paymentMethod === 'VNPAY') {
        const payRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/Payments/create-vnpay-url/${res.data.orderId}?amount=${subtotal - discount}`);
        window.location.href = payRes.data.url;
      } else {
        alert("ĐẶT HÀNG THÀNH CÔNG! 🛵");
        localStorage.removeItem('hieu_cart');
        window.dispatchEvent(new Event("storage"));
        navigate('/profile');
      }
    } catch (err) {
      console.error("Lỗi 400 tại đây:", err.response?.data);
      alert(err.response?.data?.error || "Giao dịch lỗi, check lại UserId trong SQL!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 animate-fadeIn text-gray-900 font-sans">
      <h2 className="text-5xl font-black italic uppercase mb-12">Checkout</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          
          {/* 📍 PHẦN ĐỊA CHỈ */}
          <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
             <h3 className="text-xl font-black mb-6 uppercase italic">📍 Nơi nhận trà sữa</h3>
             {addresses.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {addresses.map(addr => (
                    <div 
                      key={addr.id} 
                      onClick={() => {setSelectedAddressId(addr.id); setIsAddressConfirmed(true);}}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-blue-600 bg-blue-50' : 'border-gray-50'}`}
                    >
                      <p className="font-bold text-sm">{addr.receiverName}</p>
                      <p className="text-xs text-gray-500 mt-1">{addr.detailedAddress}</p>
                    </div>
                  ))}
               </div>
             ) : (
               <textarea 
                  value={manualAddress}
                  onChange={(e) => { setManualAddress(e.target.value); setIsAddressConfirmed(false); }}
                  placeholder="Gõ địa chỉ của Hiếu vào đây..."
                  className="w-full p-6 bg-gray-50 rounded-[2rem] font-bold border-2 border-transparent focus:border-blue-500 outline-none h-28 resize-none mb-4"
               />
             )}
             <button onClick={() => setIsAddressConfirmed(true)} className={`px-8 py-3 rounded-2xl font-black text-xs uppercase ${isAddressConfirmed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {isAddressConfirmed ? "✓ Địa chỉ hợp lệ" : "Xác nhận địa chỉ"}
             </button>
          </section>

          {/* 💳 PHẦN THANH TOÁN */}
          <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
             <h3 className="text-xl font-black mb-6 uppercase italic tracking-tighter">💳 Cách trả tiền</h3>
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setPaymentMethod('COD')} className={`p-6 rounded-3xl border-2 font-black transition-all ${paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-50'}`}>TIỀN MẶT</button>
                <button onClick={() => setPaymentMethod('VNPAY')} className={`p-6 rounded-3xl border-2 font-black transition-all ${paymentMethod === 'VNPAY' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-50'}`}>VNPAY ONLINE</button>
             </div>
          </section>

          {/* 🛒 DANH SÁCH MÓN */}
          <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
             <h3 className="font-black mb-6 uppercase text-gray-400 tracking-widest italic">Giỏ hàng của Hiếu ({cart.length})</h3>
             {cart.map(item => (
                <div key={item.cartId} className="flex items-center gap-6 bg-gray-50 p-5 rounded-[2.5rem] mb-4">
                   <img src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`} className="w-20 h-20 rounded-2xl object-cover shadow-sm" alt="mon" />
                   <div className="flex-grow">
                      <h4 className="font-black text-gray-800 uppercase text-lg italic">{item.productName}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase">Size {item.size}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm">
                      <button onClick={() => updateQuantity(item.cartId, -1)} className="w-8 h-8 font-black hover:text-red-500 transition-colors">-</button>
                      <span className="font-black w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartId, 1)} className="w-8 h-8 font-black hover:text-green-500 transition-colors">+</button>
                   </div>
                   <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 font-black text-2xl p-2 hover:scale-125 transition-transform">×</button>
                </div>
             ))}
          </section>
        </div>

        {/* 📋 HÓA ĐƠN */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-50 space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 text-6xl opacity-[0.03] font-black italic">BILL</div>
             <h3 className="font-black text-3xl uppercase italic border-b border-gray-100 pb-6">Tổng kết</h3>
             
             {/* PHẦN VOUCHER ĐÃ DÙNG BIẾN ĐỂ HẾT GẠCH ĐỎ */}
             <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-2 block">Mã giảm giá</label>
                <div className="flex gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:border-blue-500 transition-all">
                   <input 
                      type="text" value={voucherCode} 
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="HIEUSTORE2026..."
                      className="flex-grow bg-transparent px-4 font-black outline-none uppercase text-xs"
                   />
                   <button onClick={applyVoucher} disabled={isApplying} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-[10px] hover:bg-blue-600 transition-all">
                      {isApplying ? "..." : "DÙNG"}
                   </button>
                </div>
             </div>

             <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Lời nhắn cho nhà bếp..." className="w-full bg-gray-50 rounded-2xl p-4 font-bold text-xs outline-none h-24 border-2 border-transparent focus:border-blue-500 transition-all resize-none" />

             <div className="space-y-3 pt-6 border-t border-dashed border-gray-200">
                <div className="flex justify-between font-bold text-gray-400 text-xs uppercase tracking-widest"><span>Tạm tính</span> <span>{subtotal.toLocaleString()}đ</span></div>
                <div className="flex justify-between font-bold text-rose-500 text-xs uppercase tracking-widest"><span>Voucher</span> <span>-{discount.toLocaleString()}đ</span></div>
                <div className="flex justify-between font-black text-4xl text-gray-900 pt-6"><span>Tổng</span> <span className="text-blue-600">{(subtotal - discount).toLocaleString()}đ</span></div>
             </div>

             <button 
                onClick={handleCheckout} 
                disabled={cart.length === 0}
                className="w-full py-6 bg-blue-600 text-white rounded-[2.2rem] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest text-sm"
             >
                {paymentMethod === 'VNPAY' ? 'Thanh toán Online' : 'Xác nhận đơn hàng'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;