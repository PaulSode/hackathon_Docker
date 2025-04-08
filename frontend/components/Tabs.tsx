interface TabsProps {
    setActiveTab: React.Dispatch<React.SetStateAction<'forYou' | 'following'>>;
    activeTab: 'forYou' | 'following';
  }
  
  export default function Tabs({ setActiveTab, activeTab }: TabsProps) {
    return (
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex">
          <button
            onClick={() => setActiveTab('forYou')}
            className={`flex-1 py-4 font-medium transition-colors ${
              activeTab === 'forYou'
                ? 'bg-black text-white border-b-4 border-blue-500' // Onglet actif (noir, texte blanc, bordure bleue)
                : 'bg-black text-gray-500' // Onglet inactif (noir avec texte gris)
            } hover:bg-gray-800`} // Onglet survolé (gris foncé)
          >
            For you
          </button>
          
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-4 font-medium transition-colors ${
              activeTab === 'following'
                ? 'bg-black text-white border-b-4 border-blue-500' // Onglet actif (noir, texte blanc, bordure bleue)
                : 'bg-black text-gray-500' // Onglet inactif (noir avec texte gris)
            } hover:bg-gray-800`} // Onglet survolé (gris foncé)
          >
            Following
          </button>
        </div>
      </div>
    );
  }
  