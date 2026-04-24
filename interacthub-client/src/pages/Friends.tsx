import FriendsSection from '../components/profile/FriendsSection.tsx';

const Friends = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#18191a] py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Sử dụng lại component FriendsSection để đồng nhất giao diện */}
        <FriendsSection />
      </div>
    </div>
  );
};

export default Friends;