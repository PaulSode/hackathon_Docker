"use client";

import {
    HeartIcon,
    ChatBubbleOvalLeftIcon,
    ArrowPathIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { useRef, useEffect, useState } from "react";
import { useAppContext } from "@/app/context/appContext";

interface TweetData {
    id: number;
    username: string;
    handle: string;
    content: string;
    time: string;
    isFollowing: boolean;
}

interface Comment {
    id: number;
    content: string;
    id_tweet: number;
    author: {
        id: string;
        username: string;
        handle: string;
        profile_img: string;
    };
    createdAt: string;
}

interface TweetModalProps {
    tweet: TweetData;
    comments: Comment[];
    onClose: () => void;
}

export default function TweetModal({ tweet, comments, onClose }: TweetModalProps) {
    const [newComment, setNewComment] = useState("");
    const [commentList, setCommentList] = useState<Comment[]>(comments);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const commentInputRef = useRef<HTMLTextAreaElement>(null);
    const {appState} = useAppContext();

    useEffect(() => {
        if (commentInputRef.current) {
            commentInputRef.current.focus();
        }
    }, []);

    const handleCommentSubmit = async () => {
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
      


        try {
            const response = await fetch(`http://localhost:5000/api/tweets/${tweet.id}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${appState?.token}`,
                },
                body: JSON.stringify({ content: newComment }),
            });

            console.log("Réponse API:", response); // Debug

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erreur API:", errorData);
                throw new Error(errorData.message || "Erreur lors de l'ajout du commentaire");
            }

            const savedComment = await response.json();
            setCommentList([savedComment, ...commentList]); // Ajoute le commentaire en haut de la liste
            setNewComment("");
        } catch (error) {
            console.error("Erreur:", error);
            alert(`Impossible d'ajouter le commentaire : ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 flex justify-center items-start overflow-y-auto pt-22"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-2xl rounded-xl shadow-lg mt-10 relative p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 left-3 text-gray-500 hover:text-gray-700 transition"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <div className="border-b pb-4">
                    <div className="flex gap-3">
                        <img
                            src="/next.svg"
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{tweet.username}</span>
                                <span className="text-gray-500">{tweet.handle}</span>
                                <span className="text-gray-500">· {tweet.time}</span>
                            </div>
                            <p className="mt-2 text-lg">{tweet.content}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-around py-3 border-b text-gray-500">
                    <button className="flex items-center gap-2 hover:text-blue-500">
                        <ChatBubbleOvalLeftIcon className="w-5 h-5" />
                        <span>Reply</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-green-500">
                        <ArrowPathIcon className="w-5 h-5" />
                        <span>Retweet</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-red-500">
                        <HeartIcon className="w-5 h-5" />
                        <span>Like</span>
                    </button>
                </div>

                {/* Champ de saisie du commentaire */}
                <div className="pt-4">
                    <h4 className="font-semibold text-lg">Ajouter un commentaire</h4>
                    <textarea
                        ref={commentInputRef}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Écrire un commentaire..."
                        className="w-full border rounded p-2 mt-2"
                    ></textarea>
                    <button
                        onClick={handleCommentSubmit}
                        className={`bg-blue-500 text-white px-4 py-2 mt-2 rounded ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Envoi..." : "Commenter"}
                    </button>
                </div>

                {/* Section des commentaires */}
                <div className="space-y-4 pt-4">
                    <h4 className="font-semibold text-lg">Commentaires</h4>
                    {commentList.length > 0 ? (
                        commentList.map((comment) => (
                            <div key={comment.id} className="p-3 border rounded-lg">
                                <div className="flex items-center gap-2">
                                    <img src={comment.author.profile_img} alt="Profile" className="w-8 h-8 rounded-full" />
                                    <div>
                                        <span className="font-bold">{comment.author.username}</span>
                                        <span className="text-gray-500 text-sm"> {comment.author.handle}</span>
                                    </div>
                                </div>
                                <p className="text-gray-700 mt-2">{comment.content}</p>
                                <span className="text-gray-500 text-xs">{comment.createdAt}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">Aucun commentaire pour l’instant.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
