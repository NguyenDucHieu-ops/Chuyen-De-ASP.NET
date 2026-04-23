import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import PaginatedList from '../../../components/PaginatedList';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [imageFile, setImageFile] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null); 

  const [notify, setNotify] = useState({ show: false, message: '', type: 'success' });
  const showSystemNotify = (msg, type = 'success') => {
    setNotify({ show: true, message: msg, type });
    setTimeout(() => setNotify({ show: false, message: '', type: 'success' }), 3000);
  };

  const token = localStorage.getItem('hieu_store_token');
  const headers = { Authorization: `Bearer ${token}` };

  const [sizes, setSizes] = useState({
    M: { active: true, price: '' }, 
    L: { active: false, price: '' },
    XL: { active: false, price: '' }
  });

  const [newProduct, setNewProduct] = useState({ 
    productName: '', categoryId: 1, description: '', isActive: true 
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Products`);
      setProducts(res.data);
    } catch (err) { 
        console.error("Lỗi fetch:", err); 
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    showSystemNotify("Đang xử lý dữ liệu Excel...", "success");

    try {
      // 💡 ĐÃ SỬA: Bỏ cái 'Content-Type' đi để Axios tự lo vụ Boundary
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/Products/import`, formData, {
        headers: headers 
      });

      const data = res.data;
      
      if (data.errorCount > 0) {
        showSystemNotify(data.message, "error");
        alert(`⚠️ PHÁT HIỆN DỮ LIỆU LỖI TRONG FILE:\n\n${data.errors.join('\n')}\n\nLưu ý: Các dòng đúng đã được nạp thành công!`);
      } else {
        showSystemNotify(data.message, "success");
      }

      fetchProducts();
    } catch (err) {
      console.error("Import Error:", err);
      showSystemNotify(err.response?.data?.error || "Lỗi hệ thống khi nạp file!", "error");
    } finally {
      e.target.value = null; 
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!newProduct.productName?.trim()) tempErrors.productName = "Tên món không được để trống!";
    if (!sizes.M.price || isNaN(parseFloat(sizes.M.price))) tempErrors.priceM = "Giá món phải là số!";
    if (!editingId && !imageFile) tempErrors.image = "Chưa có ảnh món sếp ơi!";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // 💡 ĐÃ SỬA: Ép nó dùng FormData thay vì JSON để khớp với [FromForm] của C#
  const handleToggleStatus = async (product) => {
    try {
      const formData = new FormData();
      formData.append('Id', product.id);
      formData.append('ProductName', product.productName);
      formData.append('CategoryId', product.categoryId);
      formData.append('Description', product.description || '');
      formData.append('BasePrice', product.basePrice);
      formData.append('SizeUpPrice', product.sizeUpPrice);
      formData.append('SizeXlPrice', product.sizeXlPrice);
      formData.append('HasOptions', product.hasOptions);
      formData.append('IsActive', !product.isActive); // Đảo trạng thái ở đây

      await axios.put(`${import.meta.env.VITE_API_URL}/api/Products/${product.id}`, formData, { headers });
      showSystemNotify(`Đã cập nhật trạng thái món!`);
      fetchProducts();
    } catch (err) { console.error(err); showSystemNotify("Lỗi cập nhật trạng thái!", "error"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa món này khỏi menu nhé sếp?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/Products/${id}`, { headers });
        showSystemNotify("Đã xóa vĩnh viễn sản phẩm!");
        fetchProducts();
      } catch (err) { console.error(err); showSystemNotify("Lỗi xóa dữ liệu!", "error"); }
    }
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setErrors({});
    setNewProduct({ 
      productName: product.productName, categoryId: product.categoryId, 
      description: product.description || '', isActive: product.isActive
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
    if (!validateForm()) return;
    
    const isSnack = parseInt(newProduct.categoryId) === 3; 
    const mPrice = parseFloat(sizes.M.price) || 0;
    const lPrice = (!isSnack && sizes.L.active) ? (parseFloat(sizes.L.price) || 0) : 0;
    const xlPrice = (!isSnack && sizes.XL.active) ? (parseFloat(sizes.XL.price) || 0) : 0;
    
    const upPrice = lPrice > 0 ? (lPrice - mPrice) : 0;
    const xlUpPrice = xlPrice > 0 ? (xlPrice - mPrice) : 0;

    const formData = new FormData();
    // 💡 Ép kiểu chuẩn để Backend không bao giờ báo 400
    formData.append('ProductName', newProduct.productName.trim());
    formData.append('CategoryId', String(newProduct.categoryId));
    formData.append('Description', newProduct.description || "Chưa có mô tả");
    formData.append('IsActive', String(newProduct.isActive));
    formData.append('BasePrice', String(mPrice));
    formData.append('SizeUpPrice', String(upPrice));
    formData.append('SizeXlPrice', String(xlUpPrice)); 
    formData.append('HasOptions', String(!isSnack)); 
    
    if (imageFile) {
      formData.append('ImageFile', imageFile);
    }

    try {
      showSystemNotify("Đang tải dữ liệu lên máy chủ... ⏳", "success"); // Báo cho user biết là đang chạy
      
      if (editingId) {
        formData.append('Id', String(editingId));
        await axios.put(`${import.meta.env.VITE_API_URL}/api/Products/${editingId}`, formData, { 
            headers: headers 
        });
        showSystemNotify("Cập nhật thành công! ✨");
      } else {
        // Kiểm tra ảnh khi thêm mới ngay tại Frontend cho chắc
        if(!imageFile) {
            showSystemNotify("Sếp ơi chưa chọn ảnh!", "error");
            return;
        }
        await axios.post(`${import.meta.env.VITE_API_URL}/api/Products`, formData, { 
            headers: headers 
        });
        showSystemNotify("Đã thêm món mới thành công! 🎉");
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) { 
      console.error("Lỗi chi tiết:", err.response?.data);
      showSystemNotify("Lỗi: Sếp kiểm tra lại các ô nhập liệu nhé!", "error"); 
    }
  };

  return (
    <div className="space-y-6 relative">
      {notify.show && (
        <div className={`fixed top-10 right-10 z-[100] px-8 py-4 rounded-[1.5rem] font-black uppercase text-[10px] shadow-2xl animate-bounce ${notify.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {notify.type === 'success' ? '✅ ' : '❌ '} {notify.message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight italic uppercase">Kho <span className="text-blue-600">HieuStore</span></h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest italic">Quản lý Menu & Hình ảnh (Tổng: {products.length} món)</p>
        </div>
        
        <div className="flex gap-3">
          <input type="file" ref={fileInputRef} onChange={handleImportExcel} accept=".xlsx, .xls" className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-6 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-sm">
            📥 Import Excel
          </button>
          <button onClick={() => { setEditingId(null); setErrors({}); setNewProduct({ productName: '', categoryId: 1, description: '', isActive: true }); setSizes({ M: { active: true, price: '' }, L: { active: false, price: '' }, XL: { active: false, price: '' } }); setImageFile(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95 text-[10px] tracking-widest uppercase">
            + THÊM MÓN
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">
            <tr><th className="p-8">Sản Phẩm</th><th className="p-8 text-center">Trạng Thái</th><th className="p-8 text-right">Thao Tác</th></tr>
          </thead>
          
          {loading ? (
            <tbody><tr><td colSpan="3" className="p-20 text-center font-black text-gray-300 italic animate-pulse uppercase">Đang đồng bộ...</td></tr></tbody>
          ) : products.length === 0 ? (
            <tbody><tr><td colSpan="3" className="p-20 text-center font-black text-gray-300 italic uppercase">Không có sản phẩm nào</td></tr></tbody>
          ) : (
            <PaginatedList 
              data={products} 
              itemsPerPage={6} 
              isTable={true}
              renderItem={(item) => (
                <tr key={item.id} className={`border-b border-gray-50 hover:bg-blue-50/20 transition-all ${!item.isActive ? 'bg-gray-50/30' : ''}`}>
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <img src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`} className={`w-16 h-16 rounded-2xl object-cover shadow-sm ${!item.isActive ? 'grayscale opacity-40' : ''}`} onError={(e)=>e.target.src='https://placehold.co/100'} alt="mon" />
                      <div>
                          <div className={`font-black text-lg ${item.isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                            {item.productName} 
                            {!item.hasOptions && <span className="ml-2 text-[9px] bg-amber-100 text-amber-600 px-2 py-1 rounded-lg uppercase">Ăn vặt</span>}
                          </div>
                          <div className="text-[10px] text-blue-600 font-black uppercase mt-1">Giá: {item.basePrice?.toLocaleString()}đ</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <button onClick={() => handleToggleStatus(item)} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${item.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                      {item.isActive ? '● Đang Hiện' : '○ Đang Ẩn'}
                    </button>
                  </td>
                  <td className="p-8 text-right space-x-3">
                    <button onClick={() => { setSelectedProduct(item); setIsDetailOpen(true); }} className="text-gray-400 font-black uppercase text-[9px] hover:text-blue-600 transition-colors">Chi tiết</button>
                    <button onClick={() => openEditModal(item)} className="text-blue-600 font-black underline uppercase text-[9px] hover:text-blue-800">Sửa</button>
                    <button onClick={() => handleDelete(item.id)} className="text-rose-500 font-black uppercase text-[9px] hover:text-rose-700">Xóa</button>
                  </td>
                </tr>
              )}
            />
          )}
        </table>
      </div>

      {/* --- MODAL CHI TIẾT --- */}
      {isDetailOpen && selectedProduct && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl relative animate-fadeIn border border-gray-100">
            <button onClick={() => setIsDetailOpen(false)} className="absolute top-8 right-8 text-4xl font-black text-gray-300 hover:text-gray-900 transition-colors">×</button>
            <img src={`${import.meta.env.VITE_API_URL}${selectedProduct.imageUrl}`} className="w-full h-64 object-cover rounded-[2.5rem] mb-8 shadow-md" alt="detail" />
            <h2 className="text-4xl font-black text-gray-800 italic mb-2 uppercase tracking-tighter">{selectedProduct.productName}</h2>
            <div className="space-y-4 bg-gray-50 p-8 rounded-[2.5rem] mb-8 border border-gray-100 font-black text-gray-500 italic text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-3">
                  <span>{selectedProduct.hasOptions ? "Gốc (Size M):" : "Giá bán:"}</span> 
                  <span className="text-gray-900 text-lg">{selectedProduct.basePrice?.toLocaleString()}đ</span>
                </div>
                {selectedProduct.hasOptions && (
                  <>
                    <div className="flex justify-between border-b border-gray-200 pb-3"><span>Giá Size L:</span> <span className="text-blue-600 text-lg">{(selectedProduct.basePrice + selectedProduct.sizeUpPrice)?.toLocaleString()}đ</span></div>
                    <div className="flex justify-between"><span>Giá Size XL:</span> <span className="text-purple-600 text-lg">{(selectedProduct.basePrice + selectedProduct.sizeXlPrice)?.toLocaleString()}đ</span></div>
                  </>
                )}
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl italic text-gray-600 text-sm border-l-8 border-blue-500">"{selectedProduct.description || 'Chưa cập nhật mô tả.'}"</div>
          </div>
        </div>
      )}

      {/* --- MODAL THÊM / SỬA --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] p-12 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto border-4 border-blue-50 custom-scrollbar">
            <h2 className="text-3xl font-black mb-10 uppercase italic text-blue-600 tracking-tighter underline decoration-4 underline-offset-8 decoration-blue-200">
                {editingId ? "Cập Nhật Món" : "Thêm Món Mới"}
            </h2>
            <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Tên Sản Phẩm</label>
                  <input type="text" value={newProduct.productName} onChange={e => {setNewProduct({...newProduct, productName: e.target.value}); if (errors.productName) setErrors({...errors, productName: null});}} className={`w-full p-5 bg-gray-50 rounded-[1.5rem] font-black outline-none border-2 transition-all text-lg ${errors.productName ? 'border-rose-500 bg-rose-50' : 'border-transparent focus:border-blue-500'}`} />
                  {errors.productName && <p className="text-[10px] text-rose-500 font-black mt-2 ml-4 uppercase italic">⚠ {errors.productName}</p>}
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Danh Mục</label>
                  <select value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId: parseInt(e.target.value)})} className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-black outline-none border-2 border-transparent focus:border-blue-500">
                    <option value={1}>1 - Trà Sữa</option>
                    <option value={2}>2 - Cà Phê</option>
                    <option value={3}>3 - Ăn Vặt</option>
                  </select>
                </div>
                <div className="col-span-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Hiển Thị</label>
                   <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-[1.5rem] h-[68px] border-2 border-transparent">
                     <span className="text-[10px] font-black text-gray-400 uppercase">BÁN NGAY</span>
                     <input type="checkbox" checked={newProduct.isActive} onChange={e => setNewProduct({...newProduct, isActive: e.target.checked})} className="w-6 h-6 accent-blue-600 cursor-pointer" />
                   </div>
                </div>
                <div className="col-span-2 space-y-4 animate-fadeIn">
                   <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] ml-4 block">Giá Bán (VNĐ)</label>
                   <div className="bg-gray-50 p-6 rounded-[2.5rem] space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="font-black text-gray-400 uppercase text-[9px] w-16">{parseInt(newProduct.categoryId) === 3 ? "GIÁ BÁN" : "Size M"}</span>
                        <input type="number" placeholder="Giá..." value={sizes.M.price} onChange={e => {setSizes({...sizes, M: {...sizes.M, price: e.target.value}}); if (errors.priceM) setErrors({...errors, priceM: null});}} className={`flex-1 p-3 rounded-xl outline-none font-black text-lg border ${errors.priceM ? 'border-rose-500' : 'border-transparent'}`} />
                      </div>
                      {parseInt(newProduct.categoryId) !== 3 && (
                        <>
                          <div className={`flex items-center gap-4 p-3 rounded-xl transition-all ${sizes.L.active ? 'bg-blue-100/50' : 'opacity-40'}`}>
                            <input type="checkbox" checked={sizes.L.active} onChange={e => setSizes({...sizes, L: {...sizes.L, active: e.target.checked}})} className="w-5 h-5 accent-blue-600" />
                            <span className="font-black text-blue-800 uppercase text-[9px] w-16">Size L</span>
                            <input type="number" value={sizes.L.price} disabled={!sizes.L.active} onChange={e => setSizes({...sizes, L: {...sizes.L, price: e.target.value}})} className="flex-1 p-2 rounded-lg outline-none font-black border-none bg-transparent" placeholder="Tổng giá L..." />
                          </div>
                          <div className={`flex items-center gap-4 p-3 rounded-xl transition-all ${sizes.XL.active ? 'bg-purple-100/50' : 'opacity-40'}`}>
                            <input type="checkbox" checked={sizes.XL.active} onChange={e => setSizes({...sizes, XL: {...sizes.XL, active: e.target.checked}})} className="w-5 h-5 accent-purple-600" />
                            <span className="font-black text-purple-800 uppercase text-[9px] w-16">Size XL</span>
                            <input type="number" value={sizes.XL.price} disabled={!sizes.XL.active} onChange={e => setSizes({...sizes, XL: {...sizes.XL, price: e.target.value}})} className="flex-1 p-2 rounded-lg outline-none font-black border-none bg-transparent" placeholder="Tổng giá XL..." />
                          </div>
                        </>
                      )}
                   </div>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Mô tả món ăn</label>
                  <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-black outline-none h-24 border-2 border-transparent focus:border-blue-500 italic text-sm transition-all resize-none" placeholder="Nhập mô tả hấp dẫn..."></textarea>
                </div>
                <div className="col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">{editingId ? "Thay đổi ảnh món" : "Hình ảnh sản phẩm *"}</label>
                    <div className="flex items-center gap-4">
                        <input type="file" accept="image/*" onChange={e => {setImageFile(e.target.files[0]); if (errors.image) setErrors({...errors, image: null});}} className={`flex-1 p-4 bg-gray-50 rounded-[1.5rem] font-black text-xs border-2 ${errors.image ? 'border-rose-500 bg-rose-50' : 'border-transparent'}`} />
                        {editingId && !imageFile && ( <span className="text-[9px] font-black text-blue-500 uppercase italic">Ảnh cũ</span> )}
                    </div>
                    {errors.image && <p className="text-[10px] text-rose-500 font-black mt-2 ml-4 uppercase italic">⚠ {errors.image}</p>}
                </div>
            </div>
            <div className="flex gap-6 mt-12">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-6 bg-gray-100 rounded-[2rem] font-black text-gray-400 uppercase tracking-[0.2em] hover:bg-gray-200 transition-all text-xs">Đóng lại</button>
                <button onClick={handleSave} className="flex-[2] py-6 bg-blue-600 text-white rounded-[2rem] font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-[0.2em] text-xs">Lưu Dữ Liệu 🚀</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;