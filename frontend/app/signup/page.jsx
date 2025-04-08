'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function SignupPage() {
    const router = useRouter();

    // User Signup State
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');

    // Handle Input Changes
    function handleChange(e) {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    }

    // Handle Signup Submission
    async function handleSignup(e) {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:5000/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profile),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            router.push('/profile');
        } catch (err) {
            console.log(err)
            setError(err.message);
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center pt-22">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
                {/* Header */}
                <div className="relative flex items-center justify-center mb-6">
                    <button onClick={() => router.push('/')} className="absolute left-0">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-600 hover:text-gray-800 transition" />
                    </button>
                    <h1 className="text-2xl font-bold text-center text-gray-800">Sign Up</h1>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSignup}>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <div className="mb-4">
                        <label className="block text-gray-600 text-sm">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={profile.username}
                            onChange={handleChange}
                            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-600 text-sm">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-600 text-sm">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={profile.password}
                            onChange={handleChange}
                            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
}
