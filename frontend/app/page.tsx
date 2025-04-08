import Sidebar from '../components/Sidebar';
import Feed from '../components/Feed';
import Search from '../components/Search';
import SuggestedProfiles from "../components/SuggestedProfiles";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 border-x border-gray-200 max-w-2xl pt-22">
        <Feed />
      </main>
      
      <div className="w-96 hidden lg:block">
        <Search />
        <SuggestedProfiles />
      </div>
    </div>
  );
}