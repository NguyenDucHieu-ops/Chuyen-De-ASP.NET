import React, { useState } from 'react'; // 💡 Bỏ luôn useEffect ở đây

// 💡 RÚT COMPONENT CON RA NGOÀI ĐỂ TRÁNH LỖI RENDER LỒNG NHAU
const PaginationControls = ({ currentPage, totalPages, paginate }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-8 py-6 w-full">
      <button 
        onClick={() => paginate(currentPage - 1)} 
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-full flex items-center justify-center font-black text-gray-400 border-2 border-gray-100 hover:border-blue-600 hover:text-blue-600 disabled:opacity-30 disabled:hover:border-gray-100 disabled:hover:text-gray-400 transition-all"
      >
        ←
      </button>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50 px-6 py-2.5 rounded-full">
        Trang <span className="text-blue-600 text-sm">{currentPage}</span> / {totalPages}
      </span>
      <button 
        onClick={() => paginate(currentPage + 1)} 
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-full flex items-center justify-center font-black text-gray-400 border-2 border-gray-100 hover:border-blue-600 hover:text-blue-600 disabled:opacity-30 disabled:hover:border-gray-100 disabled:hover:text-gray-400 transition-all"
      >
        →
      </button>
    </div>
  );
};

const PaginatedList = ({ data, itemsPerPage = 5, listClassName = "", renderItem, isTable = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [prevDataLength, setPrevDataLength] = useState(data?.length);

  // 💡 CHUẨN REACT 18: KHÔNG DÙNG useEffect. Cập nhật state ngay trong lúc Render.
  // Nếu thấy dữ liệu bị thay đổi độ dài (ví dụ: thêm/xóa món, lọc tìm kiếm) thì reset về trang 1
  if (data?.length !== prevDataLength) {
    setPrevDataLength(data?.length);
    setCurrentPage(1);
  }

  if (!data || data.length === 0) return null;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  // 💡 Backup an toàn: Ép số trang không được vượt quá tổng số trang
  const safePage = currentPage > totalPages ? totalPages : currentPage;

  const indexOfLastItem = safePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
  };

  return (
    <>
      {isTable ? (
        <tbody className={listClassName}>
          {currentItems.map(renderItem)}
        </tbody>
      ) : (
        <div className={listClassName}>
          {currentItems.map(renderItem)}
        </div>
      )}

      {isTable ? (
        <tfoot>
          <tr>
            <td colSpan="100%">
              <PaginationControls currentPage={safePage} totalPages={totalPages} paginate={paginate} />
            </td>
          </tr>
        </tfoot>
      ) : (
        <PaginationControls currentPage={safePage} totalPages={totalPages} paginate={paginate} />
      )}
    </>
  );
};

export default PaginatedList;