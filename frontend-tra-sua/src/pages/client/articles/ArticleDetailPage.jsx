import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const ArticleDetailPage = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Articles/${id}`);
        setArticle(res.data);
      } catch (error) { console.error("Lỗi lấy chi tiết bài", error); }
      finally { setLoading(false); }
    };
    fetchArticle();
  }, [id]);

  if (loading) return <div className="text-center p-20 font-black text-gray-300 animate-pulse text-2xl uppercase">Đang mở bài báo...</div>;
  if (!article) return <div className="text-center p-20 font-black text-red-400 text-2xl uppercase">Bài viết không tồn tại!</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-xl overflow-hidden animate-[zoomIn_0.3s_ease-out]">
        
        {/* Ảnh bìa siêu to khổng lồ */}
        <div className="relative h-80 md:h-96 w-full">
          <img src={`${import.meta.env.VITE_API_URL}${article.thumbnail}`} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8">
            <Link to="/articles" className="text-blue-400 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors mb-4 inline-block">← Quay lại danh sách</Link>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic leading-tight">{article.title}</h1>
            <p className="text-white/70 font-bold uppercase tracking-widest mt-4 text-xs">Đăng ngày: {new Date(article.createdAt).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>

        {/* Nội dung bài viết xuất từ ReactQuill */}
        <div className="p-8 md:p-12">
          <div 
            className="prose prose-lg max-w-none text-gray-700
                       prose-h1:text-3xl prose-h1:font-black prose-h1:uppercase
                       prose-h2:text-2xl prose-h2:font-bold prose-h2:text-blue-600
                       prose-a:text-blue-500 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                       prose-img:rounded-2xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;