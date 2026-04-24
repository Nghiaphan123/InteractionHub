import React, { useState } from 'react';
import type { UserDetail, AboutTabType } from '../../types/user';

interface Props {
  details: UserDetail[];
  onUpdate: (updatedDetails: UserDetail[]) => void;
  isOwnProfile: boolean;
}

const AboutSection = ({ details, onUpdate, isOwnProfile }: Props) => {
  const [activeTab, setActiveTab] = useState<AboutTabType>('overview');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // State tạm thời để giữ dữ liệu khi đang sửa/thêm
  const [tempContent, setTempContent] = useState("");
  const [tempSubStatus, setTempSubStatus] = useState<'current' | 'past'>('current');

  const menuItems = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'work', label: 'Công việc và học vấn' },
    { id: 'location', label: 'Nơi từng sống' },
    { id: 'contact', label: 'Thông tin liên hệ và cơ bản' },
  ];

  const handleSave = (id?: string) => {
    if (!tempContent.trim()) return;
    let newDetails: UserDetail[];

    if (id) {
      newDetails = details.map(d => d.id === id ? { ...d, content: tempContent, subStatus: tempSubStatus } : d);
    } else {
      const typeMap: Record<string, any> = { work: 'work', location: 'location', contact: 'social' };
      const newItem: UserDetail = {
        id: Date.now().toString(),
        content: tempContent,
        type: typeMap[activeTab] || 'work',
        subStatus: tempSubStatus,
        isVisible: true
      };
      newDetails = [...details, newItem];
    }
    onUpdate(newDetails);
    setEditingId(null);
    setIsAdding(false);
  };

  const renderEditForm = (type: string, id?: string) => (
    <div className="p-4 bg-gray-50 dark:bg-zinc-800/40 rounded-lg border dark:border-zinc-700 my-2">
      {type === 'status' ? (
        <select className="w-full p-2 rounded border dark:bg-zinc-900 dark:text-white mb-3" value={tempContent} onChange={(e) => setTempContent(e.target.value)}>
          {['Độc thân', 'Hẹn hò', 'Đã kết hôn', 'Đang ly thân', 'Ly hôn'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      ) : (
        <input className="w-full p-2 rounded border dark:bg-zinc-900 dark:text-white mb-2" value={tempContent} onChange={(e) => setTempContent(e.target.value)} placeholder="Nhập thông tin..." autoFocus />
      )}
      {(['work', 'education', 'location'].includes(type)) && (
        <div className="flex gap-4 mb-3 px-1">
          <label className="flex items-center gap-2 text-sm dark:text-white cursor-pointer"><input type="radio" checked={tempSubStatus === 'current'} onChange={() => setTempSubStatus('current')} /> Đang làm/học/sống</label>
          <label className="flex items-center gap-2 text-sm dark:text-white cursor-pointer"><input type="radio" checked={tempSubStatus === 'past'} onChange={() => setTempSubStatus('past')} /> Đã tốt nghiệp/nghỉ/từng sống</label>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <button onClick={() => { setEditingId(null); setIsAdding(false); }} className="px-3 py-1 text-sm dark:text-white hover:underline">Hủy</button>
        <button onClick={() => handleSave(id)} className="bg-blue-600 text-white px-6 py-1 rounded font-bold hover:bg-blue-700">Lưu</button>
      </div>
    </div>
  );

  const renderContent = () => {
    let displayDetails: UserDetail[] = [];
    switch (activeTab) {
      case 'overview': displayDetails = details.filter(d => d.isVisible); break;
      case 'work': displayDetails = details.filter(d => ['work', 'education'].includes(d.type)); break;
      case 'location': displayDetails = details.filter(d => ['location', 'hometown'].includes(d.type)); break;
      case 'contact': displayDetails = details.filter(d => ['social', 'status'].includes(d.type)); break;
    }

    return (
      <div className="space-y-1">
        <h4 className="text-lg font-bold dark:text-white mb-4">{menuItems.find(m => m.id === activeTab)?.label}</h4>
        {displayDetails.map(item => {
          if (editingId === item.id) return <div key={item.id}>{renderEditForm(item.type, item.id)}</div>;
          let subText = "";
          let icon = "📍";
          switch (item.type) {
            case 'work': subText = item.subStatus === 'current' ? "Công việc hiện tại" : "Công việc trước đây"; icon = "💼"; break;
            case 'education': subText = item.subStatus === 'current' ? "Trường học hiện tại" : "Trường học trước đây"; icon = "🎓"; break;
            case 'location': subText = "Tỉnh/Thành phố hiện tại"; icon = "🏠"; break;
            case 'hometown': subText = "Quê quán"; icon = "📍"; break;
            case 'status': subText = "Mối quan hệ"; icon = "❤️"; break;
            case 'social': subText = "Liên kết mạng xã hội"; icon = "🔗"; break;
          }
          return (
            <div key={item.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-lg group transition">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xl">{icon}</div>
                <div><p className="dark:text-white font-semibold text-[15px]">{item.content}</p><p className="text-gray-500 dark:text-zinc-400 text-xs">{subText}</p></div>
              </div>
              {isOwnProfile && <button onClick={() => { setEditingId(item.id); setTempContent(item.content); setTempSubStatus(item.subStatus || 'current'); }} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full text-gray-500">⚙️</button>}
            </div>
          );
        })}
        {isOwnProfile && activeTab !== 'overview' && !isAdding && (
          <button onClick={() => { setIsAdding(true); setTempContent(""); setTempSubStatus('current'); }} className="w-full flex items-center gap-3 p-3 text-blue-600 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg mt-2 transition">
            <span className="text-2xl text-blue-500">+</span> Thêm {menuItems.find(m => m.id === activeTab)?.label.toLowerCase()}
          </button>
        )}
        {isAdding && renderEditForm(activeTab === 'work' ? 'work' : activeTab === 'location' ? 'location' : 'social')}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-[#242526] rounded-xl shadow flex min-h-[450px]">
      <div className="w-1/3 border-r dark:border-zinc-700 p-2"><h3 className="text-xl font-bold dark:text-white p-3 mb-2">Giới thiệu</h3>
        <nav className="flex flex-col space-y-1">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id as AboutTabType); setEditingId(null); setIsAdding(false); }} className={`text-left px-4 py-3 rounded-lg font-semibold text-[15px] transition ${activeTab === item.id ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>{item.label}</button>
          ))}
        </nav>
      </div>
      <div className="w-2/3 p-6 overflow-y-auto">{renderContent()}</div>
    </div>
  );
};
export default AboutSection;