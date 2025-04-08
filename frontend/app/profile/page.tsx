'use client';

import { useState } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import TweetsList from "@/components/TweetList";
import { gql, useQuery } from "@apollo/client";
import CommentsList from "@/components/CommentsList";

const GET_USER_INFO = gql`
  query User {
    userTimeline {
      user {
        id
        username
        email
        profile_img
        bio
      }
      tweets {
        id
        content
        media
        createdAt
        
        author {
          id
          username
          profile_img
        }
      }
      comments {
        id
        content
        author {
          id
          username
          profile_img
        }
        tweetId
        }
      likedTweets {
        id
      }
      bookmarks {
        id
        content
      }
    }
  }
`;

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('posts');

    // Récupération des données utilisateur
    const { data, loading, error } = useQuery(GET_USER_INFO, {
        fetchPolicy: "cache-and-network", // Évite d'afficher des données obsolètes
    });

    if (data) { console.log(data) }
    if (error) { console.log(error) }

    // Preparing user data
    const userData = data?.userTimeline?.user || {};
    const tweetsCount = data?.userTimeline?.tweets?.length || 0;
    const followersCount = userData?.followers?.length || 0;
    const followingCount = userData?.followings?.length || 0;

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 pt-22">
            <div className="max-w-4xl mx-auto p-4">
                {/* Profile Header */}
                <div className="relative bg-white p-6 rounded-lg shadow-md">
                    {/* Edit Profile Button in Top-Right Corner */}
                    <Link href="/editProfile">
                        <button className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition">
                            <PencilIcon className="w-6 h-6 text-gray-600" />
                        </button>
                    </Link>

                    {/* Profile Info */}
                    <div className="flex items-center space-x-6">
                        <img
                            src={userData.profile_img || "/placeholder-profile.jpg"}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover"
                        />
                        <div>
                            <h1 className="text-xl font-bold">{userData.username || "Username"}</h1>
                            <p className="text-gray-600">{userData.bio || "You don't have a bio yet."}</p>
                            <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                                <span><strong>{tweetsCount}</strong> Posts</span>
                                <span><strong>{followersCount}</strong> Followers</span>
                                <span><strong>{followingCount}</strong> Following</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-4 flex space-x-4 border-b">
                    {['posts', 'comments', 'liked'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-2 px-4 ${activeTab === tab ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-500'}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Message d'erreur en cas de problème */}
                {error && (
                    <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
                        <p className="font-bold">Error:</p>
                        <p>{error.message}</p>
                    </div>
                )}

                {/* Tab Content */}
                <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
                    {activeTab === 'posts' && (
                        <div>
                            <TweetsList
                                tweets={data?.userTimeline?.tweets || []}
                                loading={loading}
                            />
                        </div>
                    )}

                    {activeTab === 'liked' && (
                        <div>
                            <TweetsList
                                tweets={data?.userTimeline?.likedTweets || []}
                                loading={loading}
                            />
                        </div>
                    )}

                    {activeTab === 'comments' && (
                        <div>
                            <CommentsList
                                comments={data?.userTimeline?.comments || []}
                                loading={loading}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}