import React, { useState } from 'react';
import type { UserDetail } from '../../types/user';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  details: UserDetail[];
  onSave: (data: UserDetail[]) => void;
}

const EditDetailsModal = ({ isOpen, onClose, details, onSave }: Props) => {
  const [tempDetails, setTempDetails] = useState<UserDetail[]>(details);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [inputStatus, setInputStatus] = useState<'past' | 'current'>('current');
  const [addingType, setAddingType] = useState<UserDetail['type'] | null>(null);

  if (!isOpen) return null;

  const handleSaveItem = (type: UserDetail['type'], contentOverride?: string) => {
    const finalContent = contentOverride || inputText;
    if (!finalContent.trim()) return;
    
    // Nếu là status, kiểm tra xem đã tồn tại chưa để cập nhật thay vì thêm mới
    const existingStatus = tempDetails.find(d => d.type === 'status');

    if (type === 'status' && existingStatus) {
      setTempDetails(tempDetails.map(d => d.type === 'status' ? { ...d, content: finalContent } : d));
    } else if (editingId) {
      setTempDetails(tempDetails.map(d => d.id === editingId ? 
        { ...d, content: finalContent, subStatus: inputStatus } : d));
    } else {
      const newItem: UserDetail = {
        id: Date.now().toString(),
        content: finalContent,
        type: type,
        subStatus: (type === 'hometown' || type === 'social' || type === 'status') ? undefined : inputStatus,
        isVisible: true
      };
      setTempDetails([...tempDetails, newItem]);
    }
    resetForm();
  };

  const resetForm = () => {
    setInputText("");
    setInputStatus('current');
    setAddingType(null);
    setEditingId(null);
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ly hôn': return '💔';
      case 'Đã kết hôn': return '💞'; // Hai trái tim dính vào nhau
      case 'Độc thân': return '🤍'; // Trái tim trắng cho sự khởi đầu
      case 'Hẹn hò': return '💖'; // Trái tim lấp lánh cho tình yêu
      case 'Đang ly thân': return '🖤'; // Trái tim đen cho nỗi buồn
      default: return '❤️'; // Icon mặc định
    }
  };
  
  const renderSection = (title: string, type: UserDetail['type'], icon: string, labelPast: string, labelCurrent: string, hasTick: boolean = true) => (
    <div className="mb-6 border-b dark:border-gray-700 pb-4 last:border-0">
      <h3 className="font-bold dark:text-white mb-3 text-base">{title}</h3>
      {tempDetails.filter(d => d.type === type).map(item => (
        <div key={item.id} className="flex items-center justify-between py-2 group">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setTempDetails(tempDetails.map(d => d.id === item.id ? {...d, isVisible: !d.isVisible} : d))}
              className={`w-10 h-5 rounded-full relative cursor-pointer transition ${item.isVisible ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              <div className={`absolute top-1 bg-white w-3 h-3 rounded-full transition-all ${item.isVisible ? 'left-6' : 'left-1'}`} />
            </div>
            <span className="dark:text-white text-sm">
              {icon} {type === 'hometown' || type === 'social' ? '' : (item.subStatus === 'current' ? labelCurrent : labelPast)} <b>{item.content}</b>
            </span>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
            <button onClick={() => { setEditingId(item.id); setInputText(item.content); setAddingType(type); setInputStatus(item.subStatus || 'current'); }} className="p-1 hover:bg-gray-100 rounded">✎</button>
            <button onClick={() => setTempDetails(tempDetails.filter(d => d.id !== item.id))} className="text-red-500 text-xs font-bold p-1">Xóa</button>
          </div>
        </div>
      ))}
      
      {addingType === type ? (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <input 
            className="w-full p-2 border rounded dark:bg-gray-900 dark:text-white mb-2" 
            value={inputText} 
            onChange={e => setInputText(e.target.value)}
            placeholder={type === 'social' ? "Dán link (VD: facebook.com/user)" : `Nhập ${title.toLowerCase()}...`}
            autoFocus
          />
          {hasTick && (
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 text-sm dark:text-white cursor-pointer">
                <input type="radio" checked={inputStatus === 'current'} onChange={() => setInputStatus('current')} /> {labelCurrent}...
              </label>
              <label className="flex items-center gap-2 text-sm dark:text-white cursor-pointer">
                <input type="radio" checked={inputStatus === 'past'} onChange={() => setInputStatus('past')} /> {labelPast}...
              </label>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-3 py-1 text-sm dark:text-white">Hủy</button>
            <button onClick={() => handleSaveItem(type)} className="bg-blue-600 text-white px-4 py-1 rounded text-sm font-bold">Lưu</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAddingType(type)} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
          <span className="text-xl">+</span> Thêm {title.toLowerCase()}
        </button>
      )}
    </div>
  );

  const currentStatusItem = tempDetails.find(d => d.type === 'status');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-[#242526] w-full max-w-xl rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-white">Chỉnh sửa chi tiết</h2>
          <button onClick={onClose} className="dark:text-white text-2xl">✕</button>
        </div>

        <div className="p-4 overflow-y-auto no-scrollbar">
          {renderSection("Học vấn", "education", "🎓", "Từng học", "Đang học")}
          {renderSection("Làm việc", "work", "💼", "Từng làm việc", "Đang làm việc")}
          {renderSection("Nơi ở", "location", "🏠", "Từng sống", "Đang sống")}
          {renderSection("Quê quán", "hometown", "📍", "", "", false)}
          
          {/* Tình trạng mối quan hệ - Nâng cấp nút gạt ngang hàng */}
          <div className="mb-6 border-b dark:border-gray-700 pb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold dark:text-white text-base">Tình trạng mối quan hệ</h3>
              {currentStatusItem && (
                <div 
                  onClick={() => setTempDetails(tempDetails.map(d => d.type === 'status' ? {...d, isVisible: !d.isVisible} : d))}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition ${currentStatusItem.isVisible ? 'bg-blue-600' : 'bg-gray-400'}`}
                >
                  <div className={`absolute top-1 bg-white w-3 h-3 rounded-full transition-all ${currentStatusItem.isVisible ? 'left-6' : 'left-1'}`} />
                </div>
              )}
            </div>
            
            <select 
                className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white text-sm cursor-pointer"
                value={currentStatusItem?.content || ""}
                onChange={(e) => handleSaveItem('status', e.target.value)}
            >
                <option value="" disabled>Chọn tình trạng mối quan hệ...</option>
                {['Độc thân', 'Hẹn hò', 'Đã kết hôn', 'Đang ly thân', 'Ly hôn'].map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
          </div>

          {renderSection("Mạng xã hội", "social", "🔗", "", "", false)}
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-[#1c1d1e]">
          <button onClick={onClose} className="px-6 py-2 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">Hủy</button>
          <button onClick={() => { onSave(tempDetails); onClose(); }} className="bg-blue-600 text-white px-10 py-2 rounded-lg font-bold">Lưu</button>
        </div>
      </div>
    </div>
  );
};

export default EditDetailsModal;