"use client";

import { useState, useRef, useCallback } from "react"
import { useQuery, gql } from "@apollo/client"
import { Image, FileImage, Smile, BarChart, MapPin, Camera } from "lucide-react"
import TweetsList from "./TweetList"
import Tabs from "./Tabs"
import { useAppContext } from "@/app/context/appContext"

// GraphQL Query pour récupérer les tweets
const GET_TWEETS = gql`
  query GetTweets {
    getTimeline {
      id
      content
      media
      likes
      retweets
      isRetweet
      isRetweeted
      isLiked
      isFollowing
      createdAt
      comments
      author {
        profile_img
        id
        username
      }
    }
  }
`;

export default function Feed() {
  const [activeTab, setActiveTab] = useState("forYou");
  // Use explicit type to match the original code
  const [activeTabTyped, setActiveTabTyped] = useState<"forYou" | "following">("forYou");
  const [newTweet, setNewTweet] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const {appState} = useAppContext();

  // Memoize static data to prevent unnecessary re-renders
  const [mediaTypes] = useState("image/*,video/*");

  // Récupération des tweets
  const { data, loading, error } = useQuery(GET_TWEETS, {
    fetchPolicy: "cache-and-network", // Évite d'afficher des données obsolètes
  });

  if (data) { console.log(data) }

  // Fonction pour sélectionner un fichier média
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    // Créer un aperçu du fichier
    const fileUrl = URL.createObjectURL(file);
    setFilePreview(fileUrl);
  }, []);

  // Fonction pour déclencher le sélecteur de fichiers
  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Fonction pour supprimer le média sélectionné
  const removeSelectedFile = useCallback(() => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Fonction pour envoyer un tweet via Fetch API
  const handlePostTweet = useCallback(async () => {
    if (!newTweet.trim() && !selectedFile) return;

    setIsLoading(true);

    try {
      // Créer un FormData pour l'envoi de fichier
      const formData = new FormData();
      formData.append('content', newTweet);

      if (selectedFile) {
        formData.append('media', selectedFile);
      }

      console.log(appState?.token)

      // Appel API avec fetch
      const response = await fetch('http://localhost:5000/api/tweets', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization : `Bearer ${appState.token}`
        }
      });

      // Log de la réponse brute pour le débogage
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${responseText}`);
      }

      // Traitement de la réponse (la conversion en JSON a déjà été faite)
      const result = JSON.parse(responseText);
      console.log('Tweet posté avec succès:', result);

      // Réinitialisation des champs
      setNewTweet("");
      removeSelectedFile();

    } catch (error) {
      console.error("Erreur lors de l'envoi du tweet:", error);
    } finally {
      setIsLoading(false);
    }
  }, [newTweet, selectedFile, removeSelectedFile]);

  return (
      <div className="flex justify-center w-full">
        <div className="max-w-[600px] w-full">
          <Tabs setActiveTab={setActiveTabTyped} activeTab={activeTabTyped} />

          {/* Message d'erreur en cas de problème */}
          {error && (
              <div className="bg-red-500 text-white p-2 rounded mb-2">
                {error.message}
              </div>
          )}

          {/* Formulaire de création de tweet */}
          <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg shadow-md mb-4 text-white">
          <textarea
              className="w-full p-2 border border-gray-600 rounded bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500"
              placeholder="What's happening?"
              value={newTweet}
              onChange={(e) => setNewTweet(e.target.value)}
              disabled={isLoading}
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          />

            {/* Aperçu du média */}
            {filePreview && (
                <div className="relative mt-2 mb-2">
                  {selectedFile.type.startsWith('image/') ? (
                      <img
                          src={filePreview}
                          alt="Preview"
                          className="w-full max-h-80 rounded-lg object-contain"
                      />
                  ) : selectedFile.type.startsWith('video/') ? (
                      <video
                          src={filePreview}
                          controls
                          className="w-full max-h-80 rounded-lg"
                      />
                  ) : (
                      <div className="p-2 bg-gray-700 rounded-lg">
                        {selectedFile.name}
                      </div>
                  )}
                  <button
                      onClick={removeSelectedFile}
                      className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full p-1 text-white"
                  >
                    ✕
                  </button>
                </div>
            )}

            {/* Input file caché */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept={mediaTypes}
                className="hidden"
            />

            {/* Boutons */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex space-x-3 text-blue-400">
                <button
                    className="hover:text-blue-300"
                    onClick={triggerFileInput}
                >
                  <Image size={20} />
                </button>
                <button className="hover:text-blue-300">
                  <FileImage size={20} />
                </button>
                <button className="hover:text-blue-300">
                  <BarChart size={20} />
                </button>
                <button className="hover:text-blue-300">
                  <Smile size={20} />
                </button>
                <button className="hover:text-blue-300">
                  <Camera size={20} />
                </button>
                <button className="hover:text-blue-300">
                  <MapPin size={20} />
                </button>
              </div>

              <button
                  className={`px-4 py-2 rounded text-white ${
                      (newTweet.trim() || selectedFile)
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-gray-500 cursor-not-allowed"
                  }`}
                  onClick={handlePostTweet}
                  disabled={(!newTweet.trim() && !selectedFile) || isLoading}
              >
                {isLoading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>

          {/* Affichage des tweets via TweetsList */}
          <TweetsList tweets={data?.getTimeline || []} loading={loading} />
        </div>
      </div>
  );
}