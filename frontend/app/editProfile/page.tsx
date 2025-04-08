'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '../context/appContext';
import { gql, useQuery } from "@apollo/client";

// GraphQL Query to get user info
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
    }
  }
`;

export default function EditProfilePage() {
    const router = useRouter();
    const { appState, setUser } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Local state for form handling
    const [bio, setBio] = useState('');
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string>('');

    // Fetch user data using GraphQL
    const { data, loading: queryLoading, refetch } = useQuery(GET_USER_INFO, {
        fetchPolicy: "cache-and-network",
    });

    // Extract user data from query result
    const userData = data?.userTimeline?.user || {};

    // Initialize form with user data when it's loaded
    useEffect(() => {
        if (userData) {
            setBio(userData.bio || '');
            setProfilePicPreview(userData.profile_img || '/placeholder-profile.jpg');
        }
    }, [userData]);

    // Handle bio input changes
    function handleBioChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setBio(e.target.value);
    }

    // Handle profile picture upload
    function handleProfilePicChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePicFile(file);
            // Create a preview URL
            const imageUrl = URL.createObjectURL(file);
            setProfilePicPreview(imageUrl);
        }
    }

    // Handle form submission with REST API
    async function handleSave() {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Create FormData for multipart/form-data submission
            const formData = new FormData();

            // Add bio to form data
            formData.append('bio', bio);

            // Add profile image if a new one was selected
            if (profilePicFile) {
                formData.append('image', profilePicFile);
            }

            const response = await fetch('http://localhost:5000/api/users/update', {
                method: 'PUT',
                body: formData,
                headers: {
                    Authorization: `Bearer ${appState.token}`
                }
            });

            // Parse response
            const responseText = await response.text();
            let data;

            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Error parsing response:', e, responseText);
                throw new Error('Invalid response from server');
            }

            // Handle unsuccessful response
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Update the user in context if available
            if (setUser && data.user) {
                setUser(data.user, appState?.token);
            }

            setSuccess(true);

            // Refetch GraphQL data to update the cache
            refetch();

            // Redirect after short delay to show success message
            setTimeout(() => {
                router.push('/profile');
            }, 1500);

        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.message || 'An error occurred while updating your profile');
        } finally {
            setIsLoading(false);
        }
    }

    // Loading indicator while fetching user data
    if (queryLoading && !data) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            <div className="max-w-4xl mx-auto p-4">

                {/* Header */}
                <div className="relative bg-white p-6 rounded-lg shadow-md flex items-center">
                    <button onClick={() => router.push('/profile')} className="absolute left-4">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-600 hover:text-gray-800 transition" />
                    </button>
                    <h1 className="text-xl font-bold mx-auto">Edit Profile</h1>
                </div>

                {/* Edit Form */}
                <div className="mt-4 bg-white p-6 rounded-lg shadow-md">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                            Profile updated successfully!
                        </div>
                    )}

                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center">
                        <label htmlFor="profilePic" className="cursor-pointer">
                            <img
                                src={profilePicPreview}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover border"
                            />
                        </label>
                        <input
                            type="file"
                            id="profilePic"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleProfilePicChange}
                        />
                        <button
                            className="text-sm text-blue-500 mt-2"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Change profile picture
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="block text-gray-600 text-sm">Username (Read-only)</label>
                            <input
                                type="text"
                                value={userData.username || ''}
                                disabled
                                className="w-full p-2 border rounded-md bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-600 text-sm">Email (Read-only)</label>
                            <input
                                type="email"
                                value={userData.email || ''}
                                disabled
                                className="w-full p-2 border rounded-md bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-600 text-sm">Bio</label>
                            <textarea
                                name="bio"
                                value={bio}
                                onChange={handleBioChange}
                                rows={3}
                                className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className={`${
                                isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                            } text-white px-6 py-2 rounded-full transition flex items-center`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}