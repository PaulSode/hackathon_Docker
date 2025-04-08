"use client";

import { useState } from "react";

interface Profile {
  username: string;
  handle: string;
  avatar: string;
  isFollowing: boolean;
}

const initialProfiles: Profile[] = [
  {
    username: "ShawFCB",
    handle: "@fcb_shaw",
    avatar: "/avatars/shaw.jpg", // Remplace avec une vraie URL
    isFollowing: false,
  },
  {
    username: "studiocyen.bsky.social",
    handle: "@studiocyen",
    avatar: "/avatars/studiocyen.jpg",
    isFollowing: false,
  },
  {
    username: "Darkheim® ✖️⚜️🍿",
    handle: "@d4rkheim",
    avatar: "/avatars/darkheim.jpg",
    isFollowing: false,
  },
];

export default function SuggestedProfiles() {
  const [profiles, setProfiles] = useState(initialProfiles);

  const handleFollowToggle = (index: number) => {
    setProfiles((prevProfiles) =>
      prevProfiles.map((profile, i) =>
        i === index ? { ...profile, isFollowing: !profile.isFollowing } : profile
      )
    );
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl mt-4">
      <h2 className="font-bold text-white text-lg mb-2">Who to follow</h2>
      {profiles.map((profile, index) => (
        <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-800 rounded-lg transition">
          <div className="flex items-center gap-3">
            <img src={profile.avatar} alt={profile.username} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="text-white font-semibold">{profile.username}</p>
              <p className="text-gray-500 text-sm">{profile.handle}</p>
            </div>
          </div>
          <button
            onClick={() => handleFollowToggle(index)}
            className={`px-4 py-1 text-sm font-medium rounded-full ${
              profile.isFollowing ? "bg-blue-500 text-white" : "bg-white text-black"
            } hover:opacity-80 transition`}
          >
            {profile.isFollowing ? "Following" : "Follow"}
          </button>
        </div>
      ))}
      <p className="text-blue-400 text-sm mt-2 cursor-pointer hover:underline">Show more</p>
    </div>
  );
}
