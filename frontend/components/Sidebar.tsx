import { HomeIcon, HashtagIcon, BellIcon, EnvelopeIcon, UserIcon } from '@heroicons/react/24/outline';
import SuggestedProfiles from "./SuggestedProfiles";

export default function Sidebar() {
  return (
    <div className="w-64 min-h-screen p-4 border-r border-gray-100 bg-black">
      <div className="text-blue-500 text-3xl font-bold mb-8">𝕏</div>
      
      <nav className="space-y-2">
        {[ 
          { icon: <HomeIcon className="h-6 w-6" />, text: "Accueil" },
          { icon: <HashtagIcon className="h-6 w-6" />, text: "Explorer" },
          { icon: <BellIcon className="h-6 w-6" />, text: "Notifications" },
          { icon: <EnvelopeIcon className="h-6 w-6" />, text: "Messages" },
          { icon: <UserIcon className="h-6 w-6" />, text: "Profil" }
        ].map((item, index) => (
          <button 
            key={index}
            className="flex items-center space-x-4 p-3 rounded-full hover:bg-gray-700 w-full transition-colors"
          >
            {item.icon}
            <span className="text-lg text-white">{item.text}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

