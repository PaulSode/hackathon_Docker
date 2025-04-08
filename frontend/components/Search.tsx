export default function Search() {
  return (
    <div className="sticky top-0 z-10 bg-black w-full p-4 border-b border-gray-700">
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher sur X"
          className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 text-white 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-700"
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
}
