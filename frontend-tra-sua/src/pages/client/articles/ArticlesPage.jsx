import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Articles`);
        setArticles(res.data);
      } catch (error) { console.error("Lỗi lấy bài viết", error); }
      finally { setLoading(false); }
    };
    fetchArticles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter">Tin Tức <span className="text-blue-600">HieuStore</span></h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest mt-2 text-xs">Cập nhật thông tin và khuyến mãi mới nhất</p>
      </div>

      {loading ? (
        <div className="text-center font-black text-gray-300 animate-pulse text-2xl uppercase italic">Đang tải bảng tin...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(article => (
            <Link to={`/article/${article.id}`} key={article.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group border border-gray-100 flex flex-col">
              <div className="overflow-hidden">
                <img src={`${import.meta.env.VITE_API_URL}${article.thumbnail}`} alt={article.title} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-3">Ngày đăng: {new Date(article.createdAt).toLocaleDateString('vi-VN')}</p>
                  <h2 className="text-xl font-black text-gray-800 line-clamp-2 uppercase group-hover:text-blue-600 transition-colors leading-tight">{article.title}</h2>
                </div>
                <div className="mt-6 flex items-center font-black text-xs text-gray-400 uppercase tracking-widest group-hover:text-blue-600">
                  Đọc tiếp <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticlesPage;