'use client';

import Link from 'next/link';

export default function CommentsList({ comments = [], loading = false }) {

    if (loading) {
        return (
            <div className="flex justify-center py-5">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!comments || comments.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                <p className="text-lg">No comments yet</p>
                <p className="mt-2 text-sm">Comments you make on tweets will appear here.</p>
            </div>
        );
    }

    // Function to format date
    const formatDate = (dateString: string | number | Date) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    return (
        <div className="space-y-4">
            {comments.map(comment => (
                <div key={comment.id} className="p-4 border-b hover:bg-gray-50 transition-colors">
                    <div className="flex gap-3">
                        {/* Author Profile Image */}
                        <img
                            src={comment.author?.profile_img || "/placeholder-profile.jpg"}
                            alt={`${comment.author?.username}'s profile`}
                            className="w-10 h-10 rounded-full object-cover"
                        />

                        <div className="flex-1">
                            {/* Comment Header */}
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{comment.author?.username}</span>
                                <span className="text-gray-500 text-sm">@{comment.author?.username}</span>
                                <span className="text-gray-500 text-sm">·</span>
                                <span className="text-gray-500 text-sm">{formatDate(comment.createdAt)}</span>
                            </div>

                            {/* Comment Content */}
                            <p className="mb-3">{comment.content}</p>

                            {/* Original Tweet Preview */}
                            <div className="mt-2 p-3 bg-gray-100 rounded-lg border border-gray-200">
                                <Link
                                    href={`/tweet/${comment.tweetId}`}
                                    className="block hover:text-blue-500 transition-colors"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm">Replying to</span>
                                        <span className="text-blue-500 text-sm">@{comment.tweet?.author?.username}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        {comment.tweet?.content?.length > 100
                                            ? `${comment.tweet.content.substring(0, 100)}...`
                                            : comment.tweet?.content}
                                    </p>
                                </Link>
                            </div>

                            {/* Comment Actions */}
                            <div className="flex gap-6 mt-3 text-gray-500 text-sm">
                                {/* Reply action - could be implemented in the future */}
                                <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}