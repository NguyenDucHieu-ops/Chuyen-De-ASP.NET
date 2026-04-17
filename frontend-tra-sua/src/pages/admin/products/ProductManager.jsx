import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [imageFile, setImageFile] = useState(null);

  // --- TRẠNG THÁI MỚI: CHI TIẾT SẢN PHẨM ---
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // QUẢN LÝ 3 SIZE CHUẨN SHOPEEFOOD
  const [sizes, setSizes] = useState({
    M: { active: true, price: '' }, 
    L: { active: false, price: '' },
    XL: { active: false, price: '' }
  });

  const [newProduct, setNewProduct] = useState({ 
    productName: '', 
    categoryId: 1,
    description: '',
    isActive: true // Field Ẩn/Hiện
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Products`);
      setProducts(res.data);
    } catch (error) { 
      console.error("Lỗi kết nối Backend!", error); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // HÀM ẨN/HIỆN NHANH TRÊN DANH SÁCH
  const handleToggleStatus = async (product) => {
    try {
      const updated = { ...product, isActive: !product.isActive };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/Products/${product.id}`, updated);
      fetchProducts();
    } catch {
      alert("Không thể cập nhật trạng thái!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa món này khỏi menu nhé?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/Products/${id}`);
        alert("Đã xóa thành công!");
        fetchProducts();
      } catch { alert("Lỗi xóa!"); }
    }
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setNewProduct({ 
      productName: product.productName, 
      categoryId: product.categoryId || 1,
      description: product.description || '',
      isActive: product.isActive
    });
    setSizes({
      M: { active: true, price: product.basePrice },
      L: { active: product.sizeUpPrice > 0, price: product.sizeUpPrice > 0 ? (product.basePrice + product.sizeUpPrice) : '' },
      XL: { active: product.sizeXlPrice > 0, price: product.sizeXlPrice > 0 ? (product.basePrice + product.sizeXlPrice) : '' }
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!newProduct.productName || !sizes.M.price) {
      alert("Thiếu Tên hoặc Giá Size M rồi!"); return;
    }

    const finalBasePrice = parseInt(sizes.M.price) || 0;
    const finalSizeUpPrice = sizes.L.active ? (parseInt(sizes.L.price) - finalBasePrice) : 0;
    const finalSizeXlPrice = sizes.XL.active ? (parseInt(sizes.XL.price) - finalBasePrice) : 0;
    const finalHasOptions = sizes.L.active || sizes.XL.active;

    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/Products/${editingId}`, {
          id: editingId, 
          productName: newProduct.productName,
          categoryId: newProduct.categoryId,
          description: newProduct.description,
          isActive: newProduct.isActive,
          basePrice: finalBasePrice,
          sizeUpPrice: finalSizeUpPrice,
          sizeXlPrice: finalSizeXlPrice,
          hasOptions: finalHasOptions
        });
        alert("Cập nhật thành công!");
      } else {
        if (!imageFile) { alert("Chưa chọn ảnh!"); return; }
        const formData = new FormData();
        formData.append('ProductName', newProduct.productName);
        formData.append('CategoryId', newProduct.categoryId);
        formData.append('Description', newProduct.description);
        formData.append('IsActive', newProduct.isActive);
        formData.append('BasePrice', finalBasePrice);
        formData.append('SizeUpPrice', finalSizeUpPrice);
        formData.append('SizeXlPrice', finalSizeXlPrice); 
        formData.append('HasOptions', finalHasOptions); 
        formData.append('ImageFile', imageFile);

        await axios.post(`${import.meta.env.VITE_API_URL}/api/Products`, formData);
        alert("Thêm món hoàn chỉnh thành công!");
      }
      setIsModalOpen(false);
      setEditingId(null);
      fetchProducts();
    } catch { alert("Lỗi lưu dữ liệu!"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight italic">Kho <span className="text-blue-600">HieuStore</span></h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Quản lý & Ẩn hiện sản phẩm</p>
        </div>
        <button onClick={() => {
            setEditingId(null);
            setNewProduct({ productName: '', categoryId: 1, description: '', isActive: true });
            setSizes({ M: { active: true, price: '' }, L: { active: false, price: '' }, XL: { active: false, price: '' } });
            setImageFile(null); setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all"
        >+ Thêm Món</button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 font-black text-xs text-gray-400 uppercase">
            <tr>
              <th className="p-6">Sản Phẩm</th>
              <th className="p-6 text-center">Trạng Thái</th>
              <th className="p-6 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="3" className="p-10 text-center animate-pulse font-bold text-gray-400">Đang tải...</td></tr> : 
            products.map(item => (
              <tr key={item.id} className={`border-b border-gray-50 hover:bg-blue-50/20 transition-all ${!item.isActive ? 'bg-gray-50/50' : ''}`}>
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <img src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`} className={`w-14 h-14 rounded-xl object-cover shadow-sm ${!item.isActive ? 'grayscale opacity-50' : ''}`} onError={(e)=>e.target.src='https://placehold.co/100'} />
                    <div>
                      <div className={`font-black ${item.isActive ? 'text-gray-800' : 'text-gray-400'}`}>{item.productName}</div>
                      <div className="text-xs text-blue-600 font-bold">M: {item.basePrice?.toLocaleString()}đ</div>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-center">
                  <button 
                    onClick={() => handleToggleStatus(item)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all border-2 ${item.isActive ? 'bg-green-100 text-green-600 border-green-100' : 'bg-red-100 text-red-600 border-red-100'}`}
                  >
                    {item.isActive ? '● Đang Hiện' : '○ Đang Ẩn'}
                  </button>
                </td>
                <td className="p-6 text-right space-x-3">
                  <button onClick={() => { setSelectedProduct(item); setIsDetailOpen(true); }} className="text-gray-400 font-bold hover:text-blue-600 transition-colors uppercase text-xs">Chi tiết</button>
                  <button onClick={() => openEditModal(item)} className="p-2 text-blue-600 font-black underline uppercase text-xs">Sửa</button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 font-bold uppercase text-xs">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL XEM CHI TIẾT (Detail) --- */}
      {isDetailOpen && selectedProduct && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative animate-fadeIn">
            <button onClick={() => setIsDetailOpen(false)} className="absolute top-6 right-6 text-3xl font-black text-gray-300 hover:text-gray-800 transition-colors">×</button>
            <img src={`${import.meta.env.VITE_API_URL}${selectedProduct.imageUrl}`} className="w-full h-60 object-cover rounded-[2rem] mb-6 shadow-md" />
            <h2 className="text-3xl font-black text-gray-800 italic mb-2 tracking-tighter uppercase">{selectedProduct.productName}</h2>
            <div className="flex gap-2 mb-6">
               <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-100">ID: {selectedProduct.id}</span>
               <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${selectedProduct.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{selectedProduct.isActive ? 'CÔNG KHAI' : 'ĐANG KHÓA'}</span>
            </div>
            <div className="space-y-3 bg-gray-50 p-6 rounded-[2rem] border border-gray-100 mb-6">
               <div className="flex justify-between font-bold text-gray-600 border-b border-gray-200 pb-2"><span>Size M (Gốc):</span> <span className="text-gray-900">{selectedProduct.basePrice?.toLocaleString()}đ</span></div>
               <div className="flex justify-between font-bold text-gray-600 border-b border-gray-200 pb-2"><span>Giá Size L:</span> <span className="text-blue-600">{(selectedProduct.basePrice + selectedProduct.sizeUpPrice)?.toLocaleString()}đ</span></div>
               <div className="flex justify-between font-bold text-gray-600 pb-2"><span>Giá Size XL:</span> <span className="text-purple-600">{(selectedProduct.basePrice + selectedProduct.sizeXlPrice)?.toLocaleString()}đ</span></div>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 italic">Ghi chú/Mô tả:</p>
            <div className="bg-gray-50 p-4 rounded-2xl italic text-gray-700 font-medium">"{selectedProduct.description || 'Không có mô tả cho món này.'}"</div>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-6 uppercase italic text-blue-600">{editingId ? "Cập Nhật Sản Phẩm" : "Thêm Món Mới"}</h2>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                 <label className="text-xs font-bold text-gray-500 uppercase ml-2">Tên Sản Phẩm</label>
                 <input type="text" value={newProduct.productName} onChange={e => setNewProduct({...newProduct, productName: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none mt-1 border-2 border-transparent focus:border-blue-500 transition-all" />
               </div>

               <div className="col-span-1">
                 <label className="text-xs font-bold text-gray-500 uppercase ml-2">Danh Mục</label>
                 <select value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId: parseInt(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none mt-1">
                    <option value={1}>1 - Trà Sữa</option>
                    <option value={2}>2 - Cà Phê</option>
                    <option value={3}>3 - Ăn Vặt</option>
                 </select>
               </div>

               <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-2 block mb-1">Hiển Thị Món</label>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl h-[56px] border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400">CHO PHÉP BÁN</span>
                    <input type="checkbox" checked={newProduct.isActive} onChange={e => setNewProduct({...newProduct, isActive: e.target.checked})} className="w-6 h-6 accent-blue-600" />
                  </div>
               </div>

               <div className="col-span-2 mt-2">
                  <label className="text-xs font-black text-blue-600 uppercase mb-2 block border-b pb-2">Giá Bán Theo Size (VNĐ)</label>
                  <div className="flex items-center gap-4 mb-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                     <span className="font-bold w-16 text-gray-700 uppercase text-[10px]">Size M</span>
                     <input type="number" placeholder="Giá Gốc..." value={sizes.M.price} onChange={e => setSizes({...sizes, M: {...sizes.M, price: e.target.value}})} className="flex-1 p-2 bg-white rounded-lg outline-none font-black text-gray-900 border border-gray-200" />
                  </div>
                  <div className={`flex items-center gap-4 mb-3 p-3 rounded-xl border ${sizes.L.active ? 'bg-blue-50/50 border-blue-200 shadow-inner' : 'bg-white border-gray-100 opacity-60'}`}>
                     <input type="checkbox" checked={sizes.L.active} onChange={e => setSizes({...sizes, L: {...sizes.L, active: e.target.checked}})} className="w-5 h-5 accent-blue-600" />
                     <span className="font-bold w-16 text-blue-800 uppercase text-[10px]">Size L</span>
                     <input type="number" placeholder="Tổng giá L..." value={sizes.L.price} disabled={!sizes.L.active} onChange={e => setSizes({...sizes, L: {...sizes.L, price: e.target.value}})} className="flex-1 p-2 border border-blue-200 rounded-lg outline-none font-black text-blue-900 disabled:bg-gray-100" />
                  </div>
                  <div className={`flex items-center gap-4 p-3 rounded-xl border ${sizes.XL.active ? 'bg-purple-50/50 border-purple-200 shadow-inner' : 'bg-white border-gray-100 opacity-60'}`}>
                     <input type="checkbox" checked={sizes.XL.active} onChange={e => setSizes({...sizes, XL: {...sizes.XL, active: e.target.checked}})} className="w-5 h-5 accent-purple-600" />
                     <span className="font-bold w-16 text-purple-800 uppercase text-[10px]">Size XL</span>
                     <input type="number" placeholder="Tổng giá XL..." value={sizes.XL.price} disabled={!sizes.XL.active} onChange={e => setSizes({...sizes, XL: {...sizes.XL, price: e.target.value}})} className="flex-1 p-2 border border-purple-200 rounded-lg outline-none font-black text-purple-900 disabled:bg-gray-100" />
                  </div>
               </div>

               <div className="col-span-2">
                 <label className="text-xs font-bold text-gray-500 uppercase ml-2">Mô tả (Nguyên liệu, vị...)</label>
                 <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none mt-1 h-20 border border-gray-200"></textarea>
               </div>

               {!editingId && (
                 <div className="col-span-2">
                   <label className="text-xs font-bold text-gray-500 uppercase mb-1 ml-2 block">Hình Ảnh Món</label>
                   <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full p-3 bg-gray-50 rounded-2xl font-bold text-sm" />
                 </div>
               )}
            </div>

            <div className="flex gap-4 mt-8">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-400 hover:bg-gray-200 transition-all uppercase text-xs">Hủy</button>
               <button onClick={handleSave} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all uppercase text-xs">Lưu Database Xịn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;