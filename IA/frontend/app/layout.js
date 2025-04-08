import './globals.css';
import { Inter } from 'next/font/google';

// Définir la police Inter pour l'application
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'AI Emotion Scanner - Analyse faciale en temps réel',
  description: 'Application de reconnaissance d\'émotions faciales utilisant l\'intelligence artificielle pour analyser les expressions du visage en temps réel.',
  keywords: 'émotions, IA, reconnaissance faciale, analyse émotionnelle, temps réel',
  authors: [{ name: 'Votre Nom' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        {/* Ajoutez ici d'éventuelles balises meta ou scripts supplémentaires */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen">
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}