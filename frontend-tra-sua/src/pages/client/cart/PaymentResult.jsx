import React, { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // TÍNH TOÁN TRẠNG THÁI TRỰC TIẾP TỪ URL (Fix lỗi Cascading Renders)
  const responseCode = searchParams.get('vnp_ResponseCode');
  const orderId = searchParams.get('vnp_TxnRef')?.split('_')[0];
  
  const status = responseCode === '00' ? 'success' : (responseCode ? 'fail' : 'processing');

  useEffect(() => {
    // Chỉ thực hiện SIDE EFFECT (xóa giỏ hàng) ở đây, không setStatus nữa
    if (responseCode === '00') {
      localStorage.removeItem('hieu_cart');
      window.dispatchEvent(new Event("storage"));
    }
  }, [responseCode]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="bg-white p-12 rounded-[4rem] shadow-2xl max-w-lg w-full text-center border border-gray-50 relative overflow-hidden">
        
        {status === 'processing' && (
          <div className="animate-pulse">
            <div className="text-6xl mb-6">⏳</div>
            <h2 className="text-2xl font-black uppercase italic text-gray-800">Đang xác thực giao dịch...</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-fadeIn">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">✓</div>
            <h2 className="text-4xl font-black uppercase italic text-gray-800 mb-4 tracking-tighter">Thành công!</h2>
            <p className="text-gray-500 font-bold mb-8 italic">
              Đơn hàng <span className="text-blue-600">#ORD-{orderId}</span> đã được thanh toán. 
              Hiếu chuẩn bị nhận trà sữa nhé! 🧋
            </p>
            <div className="space-y-4">
              <Link to="/profile" className="block w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-700 transition-all">Lịch sử đơn hàng</Link>
              <Link to="/" className="block text-gray-400 font-bold text-xs uppercase hover:text-gray-600">Về trang chủ</Link>
            </div>
          </div>
        )}

        {status === 'fail' && (
          <div className="animate-fadeIn">
            <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">!</div>
            <h2 className="text-4xl font-black uppercase italic text-gray-800 mb-4 tracking-tighter">Thất bại</h2>
            <p className="text-gray-500 font-bold mb-8 italic">Giao dịch bị hủy hoặc lỗi. Đừng lo, đơn hàng của Hiếu vẫn còn trong giỏ.</p>
            <button onClick={() => navigate('/cart')} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-600 transition-all">Thử lại ngay</button>
          </div>
        )}

        <div className="absolute top-0 right-0 p-10 text-8xl opacity-[0.03] font-black italic select-none">VNPAY</div>
      </div>
    </div>
  );
};

export default PaymentResult;