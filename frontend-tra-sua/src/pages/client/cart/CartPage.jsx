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
  
  // 2. Voucher & Điểm thưởng
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [note, setNote] = useState('');
  
  const [userPoints, setUserPoints] = useState(0); 
  const [usePoints, setUsePoints] = useState(false); 
  const POINT_VALUE = 1000;

  // 3. TOAST THÔNG BÁO CHUYÊN NGHIỆP
  const [notify, setNotify] = useState({ show: false, msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setNotify({ show: true, msg, type });
    setTimeout(() => setNotify({ show: false, msg: '', type: 'success' }), 3000);
  };

  // 4. QUẢN LÝ ĐỊA CHỈ & LOGIC VẬN CHUYỂN
  const [addresses, setAddresses] = useState([]); 
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  
  // 💡 TỰ ĐỘNG LẤY LẠI ĐỊA CHỈ PHỤ ĐÃ LƯU TỪ TRƯỚC
  const [manualAddress, setManualAddress] = useState(() => {
    return localStorage.getItem('hieu_saved_manual_address') || '';
  }); 
  
  const [showManualInput, setShowManualInput] = useState(false); 
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD'); 

  const [shippingFee, setShippingFee] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [isCalculatingShip, setIsCalculatingShip] = useState(false);

  // 📍 TỌA ĐỘ QUÁN MẶC ĐỊNH
  const SHOP_COORDS = { lat: 10.8231, lon: 106.7666 }; 

  // Fetch dữ liệu khởi tạo
  useEffect(() => {
    if (token) {
      const headers = { Authorization: `Bearer ${token}` };
      axios.get(`${import.meta.env.VITE_API_URL}/api/Users/profile`, { headers })
        .then(res => setUserPoints(res.data.currentPoints || 0))
        .catch(() => console.log("Lỗi tải điểm"));

      axios.get(`${import.meta.env.VITE_API_URL}/api/UserAddresses`, { headers })
        .then(res => {
          setAddresses(res.data);
          if (res.data.length > 0) {
            const defaultAddr = res.data.find(a => a.isDefault) || res.data[0];
            setSelectedAddressId(defaultAddr.id);
            setShowManualInput(false);
          } else {
            setShowManualInput(true);
          }
        })
        .catch(() => setShowManualInput(true));
    }
  }, [token]);

  // CÔNG THỨC TÍNH KHOẢNG CÁCH
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  // HÀM TÍNH PHÍ SHIP
  const estimateShippingFee = async (addressText) => {
    if (!addressText.trim()) return;
    setIsCalculatingShip(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressText + ', Hồ Chí Minh, Việt Nam')}`);
      
      let finalFee = 15000; 
      let finalDist = 0;

      if (res.data && res.data.length > 0) {
        const customerLat = parseFloat(res.data[0].lat);
        const customerLon = parseFloat(res.data[0].lon);
        
        finalDist = calculateDistance(SHOP_COORDS.lat, SHOP_COORDS.lon, customerLat, customerLon);
        
        if (finalDist <= 2) {
          finalFee = 5000; 
        } else {
          finalFee = 5000 + Math.ceil(finalDist - 2) * 5000;
        }
      } else {
        showToast("Dùng phí ship mặc định do không tìm thấy tọa độ chuẩn!", "error");
      }

      setDistanceKm(finalDist);
      setShippingFee(finalFee);
      setIsAddressConfirmed(true);
      showToast(finalDist > 0 ? `Khoảng cách: ${finalDist.toFixed(1)}km. Phí ship: ${finalFee.toLocaleString()}đ` : "Đã xác nhận địa chỉ!");

    // 💡 FIX LỖI: Bỏ chữ err trong ngoặc
    } catch {
      setShippingFee(15000); 
      setIsAddressConfirmed(true);
      showToast("Dùng phí ship mặc định do lỗi kết nối!", "error");
    } finally {
      setIsCalculatingShip(false);
    }
  };

  // Các hàm Giỏ hàng
  const saveCart = (newCart) => { setCart(newCart); localStorage.setItem('hieu_cart', JSON.stringify(newCart)); window.dispatchEvent(new Event("storage")); };
  
  const updateQuantity = (cartId, delta) => {
    const newCart = cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty !== item.quantity) showToast(delta > 0 ? `Đã thêm món ${item.productName}` : `Đã bớt món ${item.productName}`, 'success');
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveCart(newCart);
  };
  
  const removeFromCart = (cartId) => {
    const itemToRemove = cart.find(i => i.cartId === cartId);
    if (window.confirm(`Xoá món "${itemToRemove?.productName}" khỏi giỏ hàng?`)) {
      const newCart = cart.filter(item => item.cartId !== cartId);
      saveCart(newCart);
      showToast(`Đã xoá ${itemToRemove?.productName} khỏi giỏ`, 'error');
    }
  };

  // TÍNH TOÁN TIỀN BẠC CHUẨN XÁC
  const subtotal = cart.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
  const maxPointsPossible = Math.floor((subtotal + shippingFee - discount) / POINT_VALUE);
  const actualPointsToUse = Math.min(userPoints, maxPointsPossible);
  const pointsDiscount = usePoints ? actualPointsToUse * POINT_VALUE : 0;
  
  const finalTotal = subtotal + shippingFee - discount - pointsDiscount;

  const applyVoucher = async () => {
    if (!voucherCode) return showToast("Sếp chưa nhập mã voucher!", "error");
    setIsApplying(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Vouchers`);
      const v = res.data.find(x => x.code === voucherCode.toUpperCase() && x.isActive);
      if (v) { 
        setDiscount(v.discountAmount); 
        showToast(`Mã hợp lệ! Giảm ngay ${v.discountAmount.toLocaleString()}đ`, 'success'); 
      } else { 
        showToast("Mã voucher không tồn tại hoặc hết hạn!", 'error'); 
        setDiscount(0); 
      }
    // 💡 FIX LỖI: Bỏ chữ err trong ngoặc
    } catch { showToast("Lỗi hệ thống voucher!", 'error'); } 
    finally { setIsApplying(false); }
  };

  const handleCheckout = async () => {
    if (!token) { showToast("Sếp đăng nhập đã nhé!", 'error'); navigate('/login'); return; }
    if (cart.length === 0) return showToast("Giỏ hàng trống trơn à!", "error");
    if (!isAddressConfirmed) return showToast("Sếp hãy xác nhận địa chỉ để tính phí ship nhé!", 'error');

    const finalAddressStr = showManualInput 
      ? manualAddress 
      : addresses.find(a => a.id === selectedAddressId)?.detailedAddress;

    const distanceText = distanceKm > 0 ? ` (Cách quán ${distanceKm.toFixed(1)}km)` : '';

    const orderData = {
      addressId: selectedAddressId || 1, 
      voucherCode: discount > 0 ? voucherCode : null,
      usedPoints: usePoints ? actualPointsToUse : 0, 
      shippingFee: shippingFee,
      note: `[ĐỊA CHỈ: ${finalAddressStr}${distanceText}] - Phí ship: ${shippingFee}đ - ${note}`,
      items: cart.map(i => ({
        productId: i.productId, quantity: i.quantity, size: i.size, toppingIds: i.toppingIds
      }))
    };

    showToast("Hệ thống đang xử lý đơn hàng...", "success");

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/Orders/checkout`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (showManualInput && manualAddress.trim()) {
        localStorage.setItem('hieu_saved_manual_address', manualAddress);
      }

      if (paymentMethod === 'VNPAY') {
        const payRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/Payments/create-vnpay-url/${res.data.orderId}?amount=${finalTotal}`);
        window.location.href = payRes.data.url;
      } else {
        showToast("ĐẶT HÀNG THÀNH CÔNG! ĐANG CHUYỂN HƯỚNG...", "success");
        localStorage.removeItem('hieu_cart');
        window.dispatchEvent(new Event("storage"));
        setTimeout(() => navigate('/profile'), 2000);
      }
    } catch (error) { 
      // 💡 CHỖ NÀY GIỮ LẠI VÌ CÓ SỬ DỤNG `error.response`
      showToast(error.response?.data?.error || "Giao dịch bị lỗi sếp ơi!", 'error'); 
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 animate-fadeIn text-gray-900 relative min-h-screen">
      
      {/* TOAST NOTIFICATION UI */}
      {notify.show && (
        <div className={`fixed top-10 right-10 z-[300] px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] shadow-2xl animate-bounce tracking-widest border-2 flex items-center gap-3 ${
          notify.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
        }`}>
          {notify.type === 'success' ? '✅' : '❌'} {notify.msg}
        </div>
      )}

      <h2 className="text-5xl font-black italic uppercase mb-12 tracking-tighter text-indigo-900">Checkout <span className="text-indigo-400">Shop</span></h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          
          {/* 📍 ĐỊA CHỈ & LOGIC TÍNH SHIP */}
          <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden">
             {isCalculatingShip && (
               <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                 <div className="animate-pulse font-black text-indigo-600 tracking-widest uppercase text-sm">Đang quét Radar vệ tinh... 🛰️</div>
               </div>
             )}

             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black uppercase italic flex items-center gap-2">📍 Giao hàng đến</h3>
             </div>

             {!showManualInput && addresses.length > 0 && (
               <div className="space-y-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div 
                        key={addr.id} 
                        onClick={() => {
                          setSelectedAddressId(addr.id); 
                          setIsAddressConfirmed(false); 
                        }}
                        className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all relative ${selectedAddressId === addr.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-50 hover:border-indigo-200'}`}
                      >
                        {selectedAddressId === addr.id && <div className="absolute top-4 right-4 w-4 h-4 bg-indigo-600 rounded-full border-4 border-indigo-200"></div>}
                        <p className="font-black text-sm uppercase text-gray-800">{addr.receiverName}</p>
                        <p className="text-xs text-gray-500 font-bold mt-2 leading-relaxed">{addr.detailedAddress}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => {setShowManualInput(true); setIsAddressConfirmed(false);}} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline mt-2 inline-block">
                    + Giao đến địa chỉ khác
                  </button>
               </div>
             )}

             {showManualInput && (
               <div className="space-y-3 animate-fadeIn mb-4">
                 <div className="bg-gray-50 p-2 rounded-[2.5rem] border-2 border-indigo-100 focus-within:border-indigo-500 transition-all">
                    <textarea 
                      value={manualAddress}
                      onChange={(e) => { setManualAddress(e.target.value); setIsAddressConfirmed(false); }}
                      placeholder="Ví dụ: Tòa nhà TMA, Q12..."
                      className="w-full p-4 bg-transparent font-bold text-sm outline-none h-24 resize-none"
                    />
                 </div>
                 <p className="text-[10px] font-bold text-gray-400 px-4">💡 Hệ thống sẽ tự động ghi nhớ địa chỉ này cho lần sau.</p>
                 
                 {addresses.length > 0 && (
                   <button onClick={() => setShowManualInput(false)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors mt-2">
                     ← Chọn địa chỉ đã lưu
                   </button>
                 )}
               </div>
             )}

             <button 
                onClick={() => {
                  const addrText = showManualInput ? manualAddress : addresses.find(a => a.id === selectedAddressId)?.detailedAddress;
                  if(!addrText) { showToast("Nhập địa chỉ đã sếp ơi!", "error"); return; }
                  estimateShippingFee(addrText);
                }} 
                className={`px-8 py-4 w-full rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all mt-2 ${isAddressConfirmed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700'}`}
             >
                {isAddressConfirmed ? `✓ Đã xác định khoảng cách: ${distanceKm > 0 ? distanceKm.toFixed(1) + 'km' : 'Hợp lệ'}` : "🛰️ Xác nhận địa chỉ & Tính phí ship"}
             </button>
          </section>

          <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
             <h3 className="text-xl font-black mb-6 uppercase italic">💳 Hình thức thanh toán</h3>
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => {setPaymentMethod('COD'); showToast("Đã chọn Tiền mặt", 'success');}} className={`p-6 rounded-[2rem] border-2 font-black transition-all ${paymentMethod === 'COD' ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md' : 'border-gray-50 text-gray-400 hover:bg-gray-50'}`}>TIỀN MẶT</button>
                <button onClick={() => {setPaymentMethod('VNPAY'); showToast("Đã chọn VNPAY", 'success');}} className={`p-6 rounded-[2rem] border-2 font-black transition-all ${paymentMethod === 'VNPAY' ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md' : 'border-gray-50 text-gray-400 hover:bg-gray-50'}`}>VNPAY</button>
             </div>
          </section>

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

        <div className="lg:sticky lg:top-24">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-50 space-y-8 relative overflow-hidden">
             <h3 className="font-black text-3xl uppercase italic border-b border-gray-50 pb-6 tracking-tighter">Hóa đơn</h3>
             
             <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nhập mã giảm giá</label>
                <div className="flex gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:border-indigo-500 transition-all">
                   <input type="text" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} placeholder="MÃ GIẢM GIÁ..." className="flex-grow bg-transparent px-4 font-black outline-none uppercase text-xs" />
                   <button onClick={applyVoucher} disabled={isApplying} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-[10px] hover:bg-indigo-600 transition-all uppercase">Dùng</button>
                </div>
             </div>

             <div className={`p-6 rounded-[2rem] border-2 transition-all ${usePoints ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-transparent'}`}>
                <div className="flex justify-between items-center mb-3">
                   <div className="flex items-center gap-2">
                      <span className="text-lg">⭐</span>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Điểm hiện có: <span className="text-emerald-600">{userPoints}</span></p>
                   </div>
                   <input type="checkbox" checked={usePoints} onChange={(e) => {setUsePoints(e.target.checked); showToast(e.target.checked ? "Đã dùng điểm tích luỹ" : "Đã huỷ dùng điểm", "success");}} disabled={userPoints <= 0} className="w-6 h-6 accent-emerald-600 cursor-pointer" />
                </div>
                <p className="text-[9px] font-bold text-gray-400 leading-relaxed uppercase">{usePoints ? `Giảm được ${(actualPointsToUse * POINT_VALUE).toLocaleString()}đ` : `1 điểm đổi được ${POINT_VALUE.toLocaleString()}đ giảm giá`}</p>
             </div>

             <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú đơn hàng..." className="w-full bg-gray-50 rounded-2xl p-5 font-bold text-xs outline-none h-24 border-2 border-transparent focus:border-indigo-500 transition-all resize-none" />

             <div className="space-y-4 pt-6 border-t border-dashed border-gray-100">
                <div className="flex justify-between font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em]"><span>Tạm tính</span> <span>{subtotal.toLocaleString()}đ</span></div>
                
                <div className="flex justify-between font-bold text-indigo-500 text-[10px] uppercase tracking-[0.2em]">
                  <span>Vận chuyển {distanceKm > 0 ? `(${distanceKm.toFixed(1)}km)` : ''}</span> 
                  <span>{isAddressConfirmed ? `${shippingFee.toLocaleString()}đ` : 'Chưa tính'}</span>
                </div>

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
                {paymentMethod === 'VNPAY' ? 'Thanh toán Online 🚀' : 'Đặt hàng ngay 🚀'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;