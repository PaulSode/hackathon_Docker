"use client";

import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import Tweet from "./Tweet";
import TweetModal from "./TweetModal";
import { GET_TWEET } from "../app/graphql/queries";

interface TweetData {
    id: number;
    username: string;
    handle: string;
    content: string;
    time: string;
    isFollowing: boolean;
    profile_img: string;
    onFollowToggle: () => void;
}

interface Comment {
    id_interaction: number;
    content: string;
    id_tweet: number;
    id_utilisateur: number;
    horodatage: string;
}

interface TweetsListProps {
    tweets: TweetData[];
    loading: boolean;
}

export default function TweetsList({ tweets, loading }: TweetsListProps) {
    const [selectedTweet, setSelectedTweet] = useState<TweetData | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);

    // Utilisation de useLazyQuery pour ne pas exécuter la requête automatiquement
    const [fetchTweet, { data, loading: tweetLoading, error }] = useLazyQuery(GET_TWEET, {
        fetchPolicy: "network-only", // Force Apollo à toujours récupérer les données du serveur,
    });

    const openTweet = (tweet: TweetData) => {
        setSelectedTweet(tweet);
        setComments([]); // Réinitialise avant de charger les nouveaux
        fetchTweet({ variables: { id: tweet.id } });
    };

    useEffect(() => {
        if (data?.getTweet?.comments) {
            setComments(data.getTweet.comments);
            console.log("Fetched comments:", data.getTweet.comments);
        } else {
            setComments([]); // Réinitialise les commentaires pour éviter l'affichage des anciens
        }
    }, [data, selectedTweet]); // Ajout de selectedTweet

    return (
        <div>
            {loading && <p className="text-center text-gray-500">Loading...</p>}

            {!loading && tweets.length > 0 ? (
                tweets.map((tweet) => (
                    <div key={tweet.id} onClick={() => openTweet(tweet)}>
                        {/* <Tweet {...tweet} /> */}
                        <Tweet 
                            {...tweet} 
                        />
                    </div>
                ))
            ) : (
                !loading && <p className="text-center text-gray-500">No tweets available</p>
            )}

            {selectedTweet && (
                <TweetModal
                    tweet={selectedTweet}
                    comments={comments}
                    loading={tweetLoading}
                    error={error}
                    onClose={() => setSelectedTweet(null)}
                />
            )}
        </div>
    );
}
