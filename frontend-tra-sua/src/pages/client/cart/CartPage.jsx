import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('hieu_store_token');
  
  // 1. Dữ liệu giỏ hàng
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('hieu_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  // 2. Trạng thái Voucher & Điểm thưởng
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [note, setNote] = useState('');
  
  const [userPoints, setUserPoints] = useState(0); 
  const [usePoints, setUsePoints] = useState(false); 
  const POINT_VALUE = 1000; // 💡 1 điểm = 1,000đ

  // 💡 HỆ THỐNG THÔNG BÁO CHUYÊN NGHIỆP (TOAST) - KHÔNG CÒN ALERT NỮA
  const [notify, setNotify] = useState({ show: false, msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setNotify({ show: true, msg, type });
    setTimeout(() => setNotify({ show: false, msg: '', type: 'success' }), 3000);
  };

  // 3. Quản lý địa chỉ & Thanh toán
  const [addresses, setAddresses] = useState([]); 
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [manualAddress, setManualAddress] = useState(''); 
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD'); 

  // Lấy dữ liệu điểm và địa chỉ
  useEffect(() => {
    if (token) {
      const headers = { Authorization: `Bearer ${token}` };
      axios.get(`${import.meta.env.VITE_API_URL}/api/Users/profile`, { headers })
        .then(res => setUserPoints(res.data.currentPoints || 0))
        .catch(() => showToast("Không thể tải điểm thưởng", "error"));

      axios.get(`${import.meta.env.VITE_API_URL}/api/UserAddresses`, { headers })
        .then(res => {
          setAddresses(res.data);
          if (res.data.length > 0) {
            const defaultAddr = res.data.find(a => a.isDefault) || res.data[0];
            setSelectedAddressId(defaultAddr.id);
            setIsAddressConfirmed(true);
          }
        })
        .catch(() => console.log("Chưa có địa chỉ"));
    }
  }, [token]);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('hieu_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  // THÔNG BÁO KHI CẬP NHẬT SỐ LƯỢNG
  const updateQuantity = (cartId, delta) => {
    const newCart = cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty !== item.quantity) {
            showToast(delta > 0 ? `Đã thêm món ${item.productName}` : `Đã bớt món ${item.productName}`, 'success');
        }
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveCart(newCart);
  };

  // THÔNG BÁO KHI XÓA MÓN
  const removeFromCart = (cartId) => {
    const itemToRemove = cart.find(i => i.cartId === cartId);
    // Lưu ý: Confirm là của trình duyệt để xác nhận, nếu muốn xịn hẳn sếp nên làm Modal.
    // Nhưng tui đã thêm showToast sau khi xoá để báo thành công.
    if (window.confirm(`Xoá món "${itemToRemove?.productName}"?`)) {
      const newCart = cart.filter(item => item.cartId !== cartId);
      saveCart(newCart);
      showToast(`Đã xoá ${itemToRemove?.productName} khỏi giỏ`, 'error');
    }
  };

  const subtotal = cart.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
  const maxPointsPossible = Math.floor((subtotal - discount) / POINT_VALUE);
  const actualPointsToUse = Math.min(userPoints, maxPointsPossible);
  const pointsDiscount = usePoints ? actualPointsToUse * POINT_VALUE : 0;
  const finalTotal = subtotal - discount - pointsDiscount;

  const applyVoucher = async () => {
    if (!voucherCode) return showToast("Sếp chưa nhập mã voucher!", "error");
    setIsApplying(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Vouchers`);
      const v = res.data.find(x => x.code === voucherCode.toUpperCase() && x.isActive);
      if (v) {
        setDiscount(v.discountAmount);
        showToast(`Mã ngon! Giảm ngay ${v.discountAmount.toLocaleString()}đ`, 'success');
      } else {
        showToast("Mã này không dùng được sếp ơi!", 'error');
        setDiscount(0);
      }
    } catch { 
      showToast("Lỗi kết nối voucher!", 'error'); 
    } finally { 
      setIsApplying(false); 
    }
  };

  const handleCheckout = async () => {
    if (!token) { showToast("Sếp đăng nhập đã nhé!", 'error'); navigate('/login'); return; }
    if (cart.length === 0) return showToast("Giỏ hàng trống trơn à!", "error");
    if (!isAddressConfirmed && !manualAddress) { showToast("Vui lòng xác nhận địa chỉ!", 'error'); return; }

    const finalAddressStr = isAddressConfirmed 
      ? (addresses.find(a => a.id === selectedAddressId)?.detailedAddress || manualAddress)
      : manualAddress;

    const orderData = {
      addressId: selectedAddressId || 1, 
      voucherCode: discount > 0 ? voucherCode : null,
      usedPoints: usePoints ? actualPointsToUse : 0, 
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
        const payRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/Payments/create-vnpay-url/${res.data.orderId}?amount=${finalTotal}`);
        window.location.href = payRes.data.url;
      } else {
        showToast("ĐẶT HÀNG THÀNH CÔNG! ĐANG CHUYỂN HƯỚNG...", "success");
        localStorage.removeItem('hieu_cart');
        window.dispatchEvent(new Event("storage"));
        setTimeout(() => navigate('/profile'), 2000);
      }
    } catch (err) {
      showToast(err.response?.data?.error || "Giao dịch bị lỗi sếp ơi!", 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 animate-fadeIn text-gray-900 relative min-h-screen">
      
      {/* 💡 GIAO DIỆN THÔNG BÁO (TOAST UI) - CHUẨN XỊN */}
      {notify.show && (
        <div className={`fixed top-10 right-10 z-[300] px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] shadow-2xl animate-bounce tracking-widest border-2 flex items-center gap-3 ${
          notify.type === 'success' 
          ? 'bg-emerald-500 text-white border-emerald-400' 
          : 'bg-rose-500 text-white border-rose-400'
        }`}>
          {notify.type === 'success' ? '✅' : '❌'} {notify.msg}
        </div>
      )}

      <h2 className="text-5xl font-black italic uppercase mb-12 tracking-tighter text-indigo-900">Checkout <span className="text-indigo-400">Shop</span></h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          
          {/* 📍 ĐỊA CHỈ */}
          <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
             <h3 className="text-xl font-black mb-6 uppercase italic flex items-center gap-2">📍 Địa chỉ nhận hàng</h3>
             {addresses.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {addresses.map(addr => (
                    <div 
                      key={addr.id} 
                      onClick={() => {
                        setSelectedAddressId(addr.id); 
                        setIsAddressConfirmed(true);
                        showToast(`Chọn địa chỉ: ${addr.receiverName}`);
                      }}
                      className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-50'}`}
                    >
                      <p className="font-black text-sm uppercase">{addr.receiverName}</p>
                      <p className="text-xs text-gray-400 font-bold mt-1 truncate">{addr.detailedAddress}</p>
                    </div>
                  ))}
               </div>
             ) : (
               <textarea 
                 value={manualAddress}
                 onChange={(e) => { setManualAddress(e.target.value); setIsAddressConfirmed(false); }}
                 placeholder="Nhập địa chỉ..."
                 className="w-full p-6 bg-gray-50 rounded-[2rem] font-bold border-2 border-transparent focus:border-indigo-500 outline-none h-28 resize-none mb-4"
               />
             )}
             <button onClick={() => {setIsAddressConfirmed(true); showToast("Đã xác nhận địa chỉ!");}} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest ${isAddressConfirmed ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {isAddressConfirmed ? "✓ Đã xong" : "Xác nhận địa chỉ này"}
             </button>
          </section>

          {/* 💳 THANH TOÁN */}
          <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
             <h3 className="text-xl font-black mb-6 uppercase italic">💳 Hình thức thanh toán</h3>
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => {setPaymentMethod('COD'); showToast("Chọn Tiền mặt");}} className={`p-6 rounded-[2rem] border-2 font-black transition-all ${paymentMethod === 'COD' ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md' : 'border-gray-50 text-gray-400'}`}>TIỀN MẶT</button>
                <button onClick={() => {setPaymentMethod('VNPAY'); showToast("Chọn VNPAY");}} className={`p-6 rounded-[2rem] border-2 font-black transition-all ${paymentMethod === 'VNPAY' ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md' : 'border-gray-50 text-gray-400'}`}>VNPAY</button>
             </div>
          </section>

          {/* 🧋 GIỎ HÀNG */}
          <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
             <h3 className="font-black mb-6 uppercase text-gray-400 tracking-widest italic">Giỏ hàng của sếp ({cart.length})</h3>
             {cart.map(item => (
                <div key={item.cartId} className="flex items-center gap-6 bg-gray-50/50 p-5 rounded-[2.5rem] mb-4 border border-transparent hover:border-indigo-100 transition-all">
                   <img src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-sm" alt="mon" />
                   <div className="flex-grow">
                      <h4 className="font-black text-gray-800 uppercase text-lg italic tracking-tight">{item.productName}</h4>
                      <p className="text-[10px] font-black text-indigo-600 uppercase mt-1">Size {item.size} • {(item.unitPrice).toLocaleString()}đ</p>
                   </div>
                   <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                      <button onClick={() => updateQuantity(item.cartId, -1)} className="font-black text-gray-400 hover:text-red-500 transition-all text-xl">-</button>
                      <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartId, 1)} className="font-black text-gray-400 hover:text-emerald-500 transition-all text-xl">+</button>
                   </div>
                   <button onClick={() => removeFromCart(item.cartId)} className="text-gray-300 hover:text-red-500 transition-colors ml-2 font-black text-2xl">×</button>
                </div>
             ))}
          </section>
        </div>

        {/* 📋 TỔNG KẾT */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-50 space-y-8 relative overflow-hidden">
             <h3 className="font-black text-3xl uppercase italic border-b border-gray-50 pb-6 tracking-tighter">Hóa đơn</h3>
             
             {/* VOUCHER */}
             <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nhập mã giảm giá</label>
                <div className="flex gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:border-indigo-500 transition-all">
                   <input 
                      type="text" value={voucherCode} 
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="MÃ GIẢM GIÁ..."
                      className="flex-grow bg-transparent px-4 font-black outline-none uppercase text-xs"
                   />
                   <button onClick={applyVoucher} disabled={isApplying} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-[10px] hover:bg-indigo-600 transition-all uppercase">Dùng</button>
                </div>
             </div>

             {/* ĐIỂM THƯỞNG */}
             <div className={`p-6 rounded-[2rem] border-2 transition-all ${usePoints ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-transparent'}`}>
                <div className="flex justify-between items-center mb-3">
                   <div className="flex items-center gap-2">
                      <span className="text-lg">⭐</span>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Điểm hiện có: <span className="text-emerald-600">{userPoints}</span></p>
                   </div>
                   <input 
                      type="checkbox" 
                      checked={usePoints} 
                      onChange={(e) => {
                        setUsePoints(e.target.checked);
                        showToast(e.target.checked ? "Đã dùng điểm tích luỹ" : "Đã huỷ dùng điểm", "success");
                      }}
                      disabled={userPoints <= 0}
                      className="w-6 h-6 accent-emerald-600 cursor-pointer"
                   />
                </div>
                <p className="text-[9px] font-bold text-gray-400 leading-relaxed uppercase">
                   {usePoints 
                     ? `Giảm được ${(actualPointsToUse * POINT_VALUE).toLocaleString()}đ` 
                     : `1 điểm đổi được ${POINT_VALUE.toLocaleString()}đ giảm giá`}
                </p>
             </div>

             <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú đơn hàng..." className="w-full bg-gray-50 rounded-2xl p-5 font-bold text-xs outline-none h-24 border-2 border-transparent focus:border-indigo-500 transition-all resize-none" />

             {/* TOTALS */}
             <div className="space-y-4 pt-6 border-t border-dashed border-gray-100">
                <div className="flex justify-between font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em]"><span>Tạm tính</span> <span>{subtotal.toLocaleString()}đ</span></div>
                {discount > 0 && <div className="flex justify-between font-bold text-rose-500 text-[10px] uppercase tracking-[0.2em]"><span>Voucher</span> <span>-{discount.toLocaleString()}đ</span></div>}
                {usePoints && <div className="flex justify-between font-bold text-emerald-600 text-[10px] uppercase tracking-[0.2em]"><span>Điểm thưởng</span> <span>-{pointsDiscount.toLocaleString()}đ</span></div>}
                
                <div className="flex justify-between font-black text-4xl text-gray-900 pt-4 tracking-tighter">
                   <span>TỔNG</span> 
                   <span className="text-indigo-600">{(finalTotal).toLocaleString()}đ</span>
                </div>
             </div>

             <button 
                onClick={handleCheckout} 
                disabled={cart.length === 0}
                className="w-full py-6 bg-indigo-600 text-white rounded-[2.2rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all uppercase tracking-widest text-sm disabled:opacity-50"
             >
                {paymentMethod === 'VNPAY' ? 'Thanh toán Online' : 'Đặt hàng ngay 🚀'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;