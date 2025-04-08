import { NextResponse } from "next/server";
import fs from "fs/promises"; // Utilisation asynchrone de fs
import path from "path";

// Définir le chemin du fichier JSON
const filePath = path.join(process.cwd(), "public/tweet.json");

// Lire les tweets depuis le fichier JSON de manière asynchrone
const readTweets = async () => {
  try {
    // Vérifier si le fichier existe avant de le lire
    await fs.access(filePath);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erreur de lecture du fichier :", error);
    return { tweets: [] }; // Retourne une structure vide pour éviter les erreurs
  }
};

// ✅ GET: Récupérer les tweets
export async function GET() {
  const tweets = await readTweets();
  return NextResponse.json(tweets);
}

// ✅ POST: Ajouter un tweet
export async function POST(req: Request) {
  try {
    const { username, handle, content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Le contenu est obligatoire" }, { status: 400 });
    }

    const tweets = await readTweets();
    const newTweet = {
      username: username || "Anonyme",
      handle: handle || "@anonymous",
      content,
      time: new Date().toLocaleTimeString(),
      isFollowing: false,
    };

    // Ajouter le nouveau tweet
    tweets.tweets.unshift(newTweet);

    // Sauvegarder dans le fichier JSON
    await fs.writeFile(filePath, JSON.stringify(tweets, null, 2), "utf-8");

    return NextResponse.json(newTweet, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement :", error);
    return NextResponse.json({ error: "Impossible de sauvegarder le tweet" }, { status: 500 });
  }
}
