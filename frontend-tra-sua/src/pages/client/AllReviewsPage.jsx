import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import PaginatedList from '../../components/PaginatedList';

const AllReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Gọi API lấy toàn bộ đánh giá đã mở AllowAnonymous
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Reviews`);
                setReviews(res.data);
            } catch (err) {
                console.error("Lỗi lấy danh sách đánh giá:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    // 💡 Tự động tính toán các thông số thống kê
    const stats = useMemo(() => {
        if (reviews.length === 0) return { avg: 0, count: 0, stars: [0,0,0,0,0] };
        const total = reviews.reduce((acc, r) => acc + r.rating, 0);
        const stars = [0,0,0,0,0];
        reviews.forEach(r => { if(r.rating >= 1 && r.rating <= 5) stars[5 - r.rating]++ });
        return {
            avg: (total / reviews.length).toFixed(1),
            count: reviews.length,
            stars: stars
        };
    }, [reviews]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 animate-fadeIn space-y-16">
            
            {/* 🌟 HEADER & RATING SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100">
                <div className="lg:col-span-1 text-center lg:text-left space-y-4">
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
                        Cảm nhận <br /> <span className="text-indigo-600">Khách Hàng</span> 💖
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Những đánh giá chân thực nhất từ cộng đồng HieuStore
                    </p>
                </div>

                <div className="lg:col-span-1 flex flex-col items-center justify-center border-y lg:border-y-0 lg:border-x border-gray-100 py-8 lg:py-0">
                    <div className="text-7xl font-black text-gray-900 tracking-tighter">{stats.avg}</div>
                    <div className="flex text-yellow-400 text-xl my-2">
                        {"★".repeat(Math.round(stats.avg))}{"☆".repeat(5 - Math.round(stats.avg))}
                    </div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stats.count} ĐÁNH GIÁ</div>
                </div>

                <div className="lg:col-span-1 space-y-2">
                    {stats.stars.map((count, i) => {
                        const starNum = 5 - i;
                        const percent = stats.count > 0 ? (count / stats.count) * 100 : 0;
                        return (
                            <div key={i} className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-gray-400 w-4">{starNum}</span>
                                <div className="flex-1 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                                </div>
                                <span className="text-[10px] font-black text-gray-300 w-8">{count}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 📝 LIST SECTION */}
            {loading ? (
                <div className="py-32 text-center">
                    <div className="inline-block w-12 h-12 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="font-black text-gray-300 italic uppercase tracking-widest animate-pulse">Đang trích xuất dữ liệu khách hàng...</p>
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-[3.5rem] border border-dashed border-gray-200">
                    <span className="text-6xl block mb-6 text-gray-200">💬</span>
                    <p className="font-black text-gray-400 uppercase italic">Chưa có đánh giá nào cho hệ thống.</p>
                </div>
            ) : (
                <PaginatedList
                    data={reviews}
                    itemsPerPage={9}
                    listClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    renderItem={(r) => (
                        <div key={r.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col gap-6 relative overflow-hidden group">
                            
                            {/* User Info Header */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">
                                    {r.user?.fullName?.charAt(0) || "K"}
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-800 uppercase text-xs tracking-tight">{r.user?.fullName || "Khách Hàng"}</h4>
                                    <div className="flex text-yellow-400 text-[10px] mt-0.5">
                                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                                    </div>
                                </div>
                                <div className="ml-auto flex flex-col items-end gap-1">
                                    <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase truncate max-w-[120px] shadow-sm border border-blue-100">
                                        {r.productName}
                                    </span>
                                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Đơn #{r.orderId}</span>
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="flex-1">
                                <p className="text-gray-600 font-medium italic text-sm leading-relaxed relative z-10">
                                    <span className="text-3xl text-indigo-100 absolute -top-4 -left-2 z-0 font-serif">“</span>
                                    {r.comment}
                                </p>
                            </div>

                            {/* Images Gallery */}
                            {r.reviewImages && r.reviewImages.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                    {r.reviewImages.map((img, i) => (
                                        <img 
                                            key={i} 
                                            src={`${import.meta.env.VITE_API_URL}${img.imageUrl}`} 
                                            className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-50 shadow-sm hover:scale-105 transition-transform cursor-pointer" 
                                            alt="review" 
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Admin Response Card */}
                            {r.adminReply && (
                                <div className="bg-indigo-50/50 p-5 rounded-[2rem] border border-indigo-100 mt-2 relative overflow-hidden group-hover:bg-indigo-50 transition-colors">
                                    <div className="absolute -right-2 -top-2 text-4xl opacity-[0.03] rotate-12">👑</div>
                                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-indigo-600 rounded-full animate-pulse"></span>
                                        Phản hồi từ quán
                                    </p>
                                    <p className="text-gray-700 font-bold italic text-xs leading-snug">"{r.adminReply}"</p>
                                </div>
                            )}
                            
                            {/* Footer info */}
                            <div className="pt-4 border-t border-gray-50 text-[9px] font-black uppercase text-gray-300 flex justify-between items-center">
                                <span className="flex items-center gap-1">
                                    <span className="w-1 h-1 bg-green-400 rounded-full"></span> Đã mua hàng
                                </span>
                                <span>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    )}
                />
            )}

            {/* 🔥 BANNER KHUYẾN KHÍCH ĐÁNH GIÁ DƯỚI CÙNG */}
            <div className="bg-zinc-900 rounded-[3.5rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="relative z-10 space-y-6">
                    <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">Bạn hài lòng với dịch vụ?</h2>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest max-w-xl mx-auto leading-loose">
                        Mỗi đánh giá của bạn là động lực để HieuStore nâng cao chất lượng sản phẩm và phục vụ tốt hơn mỗi ngày.
                    </p>
                    <div className="pt-4 text-[10px] font-black text-indigo-400 tracking-[0.3em] uppercase animate-pulse">#HIEUSTORE #FEEDBACK</div>
                </div>
            </div>
        </div>
    );
};

export default AllReviewsPage;