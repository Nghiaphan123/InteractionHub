import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { uploadImageAPI } from "../services/uploadService";

const API_BASE = "http://localhost:5162";

type Story = {
  id: number;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  imageUrl?: string;
  content?: string;
  backgroundColor?: string;
  createdAt: string;
};

const getStoriesAPI = () =>
  fetch(`${API_BASE}/api/stories`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }).then((r) => r.json());

const createStoryAPI = (data: { imageUrl?: string; content?: string; backgroundColor?: string }) =>
  fetch(`${API_BASE}/api/stories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export default function StoryBar({ autoOpenCreate = false, onClose }: {
  autoOpenCreate?: boolean,
  onClose?: () => void
} = {}) {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [viewing, setViewing] = useState<Story | null>(null);
  const [progress, setProgress] = useState(0);
  const [showCreate, setShowCreate] = useState(autoOpenCreate); // thay false thành autoOpenCreate
  const [textContent, setTextContent] = useState("");
  const [bgColor, setBgColor] = useState("#1877f2");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<any>(null);
  useEffect(() => {
    getStoriesAPI().then(setStories).catch(console.error);
  }, []);

  // Auto-close story sau 5 giây
  useEffect(() => {
    if (!viewing) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setViewing(null);
          return 0;
        }
        return p + 2;
      });
    }, 100);
    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [viewing]);

  const handleUploadStory = async (file: File) => {
    try {
      const res = await uploadImageAPI(file);
      const imageUrl = `${API_BASE}${res.data.imageUrl}`;
      const newStory = await createStoryAPI({ imageUrl });
      setStories((prev) => [newStory, ...prev]);
      setShowCreate(false);
    } catch (err) {
      console.error("Error creating story:", err);
    }
  };

  const handleCreateTextStory = async () => {
    if (!textContent.trim()) return;
    try {
      const newStory = await createStoryAPI({ content: textContent, backgroundColor: bgColor });
      setStories((prev) => [newStory, ...prev]);
      setShowCreate(false);
      setTextContent("");
    } catch (err) {
      console.error("Error creating story:", err);
    }
  };

  // Group stories theo user
  const grouped = stories.reduce((acc, s) => {
    if (!acc[s.userId]) acc[s.userId] = [];
    acc[s.userId].push(s);
    return acc;
  }, {} as Record<string, Story[]>);

  const colors = ["#1877f2", "#e74c3c", "#2ecc71", "#9b59b6", "#f39c12", "#1abc9c"];

  return (
    <>
      {/* Story Bar */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {/* Nút tạo story */}
        <div
          onClick={() => setShowCreate(true)}
          className="flex-shrink-0 w-28 h-44 rounded-2xl overflow-hidden cursor-pointer relative shadow border border-slate-200 bg-white hover:shadow-md transition"
        >
          <div className="w-full h-32 bg-slate-200 flex items-center justify-center">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl.startsWith("http") ? user.avatarUrl : `${API_BASE}${user.avatarUrl}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400" />
            )}
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white text-white text-xl font-bold">+</div>
          <div className="absolute bottom-0 w-full h-12 flex items-end justify-center pb-2 bg-white">
            <span className="text-xs font-semibold text-slate-700 text-center">Tạo story</span>
          </div>
        </div>

        {/* Danh sách story */}
        {Object.entries(grouped).map(([userId, userStories]) => {
          const first = userStories[0];
          return (
            <div
              key={userId}
              onClick={() => setViewing(first)}
              className="flex-shrink-0 w-28 h-44 rounded-2xl overflow-hidden cursor-pointer relative shadow hover:shadow-md transition"
            >
              {first.imageUrl ? (
                <img src={first.imageUrl.startsWith("http") ? first.imageUrl : `${API_BASE}${first.imageUrl}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold px-2 text-center"
                  style={{ backgroundColor: first.backgroundColor || "#1877f2" }}>
                  {first.content}
                </div>
              )}
              {/* Avatar */}
              <div className="absolute top-2 left-2 w-9 h-9 rounded-full border-4 border-blue-500 overflow-hidden">
                {first.avatarUrl ? (
                  <img src={first.avatarUrl.startsWith("http") ? first.avatarUrl : `${API_BASE}${first.avatarUrl}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-400 flex items-center justify-center text-white text-xs font-bold">
                    {first.fullName?.[0]}
                  </div>
                )}
              </div>
              {/* Tên */}
              <div className="absolute bottom-0 w-full px-2 pb-2 pt-6 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-xs font-semibold truncate">{first.fullName}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal xem story */}
      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setViewing(null)}>
          <div className="relative w-80 h-[500px] rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Progress bar */}
            <div className="absolute top-2 left-2 right-2 h-1 bg-white/30 rounded-full z-10">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            {/* Avatar + tên */}
            <div className="absolute top-5 left-3 flex items-center gap-2 z-10">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                {viewing.avatarUrl ? (
                  <img src={viewing.avatarUrl.startsWith("http") ? viewing.avatarUrl : `${API_BASE}${viewing.avatarUrl}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-400 flex items-center justify-center text-white text-xs">{viewing.fullName?.[0]}</div>
                )}
              </div>
              <span className="text-white text-sm font-semibold">{viewing.fullName}</span>
            </div>
            {/* Nội dung story */}
            {viewing.imageUrl ? (
              <img src={viewing.imageUrl.startsWith("http") ? viewing.imageUrl : `${API_BASE}${viewing.imageUrl}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold px-6 text-center"
                style={{ backgroundColor: viewing.backgroundColor || "#1877f2" }}>
                {viewing.content}
              </div>
            )}
            {/* Nút đóng */}
            <button onClick={() => setViewing(null)} className="absolute top-4 right-3 text-white text-2xl z-10">✕</button>
          </div>
        </div>
      )}

      {/* Modal tạo story */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl p-6 w-96 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Tạo story</h3>

            {/* Upload ảnh */}
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 bg-slate-100 rounded-xl font-semibold hover:bg-slate-200 transition flex items-center justify-center gap-2">
              🖼️ Tạo story ảnh
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUploadStory(e.target.files[0])} />

            <div className="text-center text-slate-400 text-sm">hoặc</div>

            {/* Text story */}
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Nhập nội dung story..."
              className="w-full p-3 border border-slate-200 rounded-xl outline-none resize-none text-sm"
              rows={3}
            />

            {/* Chọn màu nền */}
            <div className="flex gap-2">
              {colors.map((c) => (
                <button key={c} onClick={() => setBgColor(c)}
                  className={`w-8 h-8 rounded-full border-4 transition ${bgColor === c ? "border-slate-800 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>

            <button onClick={handleCreateTextStory}
              className="w-full py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
              Đăng story
            </button>
            <button onClick={() => setShowCreate(false)}
              className="w-full py-2 bg-slate-100 rounded-xl font-semibold hover:bg-slate-200 transition">
              Hủy
            </button>
          </div>
        </div>
      )}
    </>
  );
}