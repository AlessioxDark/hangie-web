import SearchLensIcon from "@/assets/icons/SearchLensIcon";
import { X } from "lucide-react";

const SearchBar = ({ query, setQuery }) => {
  const handleClearInput = () => {
    setQuery("");
  };
  return (
    <div
      className="border border-bg-3 p-1 px-3  2xl:p-3 h-1 rounded-4xl flex flex-row justify-between items-center  bg-bg-2 w-full mx-auto focus-within:ring-2 focus-within:ring-primary
      flex-1 shadow-inner transition-shadow
    
    "
    >
      <div className="flex gap-2 flex-row w-full items-center group">
        <div className="w-6 h-6 2xl:w-8 2xl:h-8">
          <SearchLensIcon />
        </div>
        <input
          type="text"
          className="w-full h-full text-base 2xl:text-lg outline-none  flex items-center placeholder-text-2 focus:outline-none font-body text-text-1 min-h-10 max-h-32 whitespace-pre-wrap "
          placeholder="Cerca..."
          onInput={(e) => {
            setQuery(e.target.value);
          }}
          value={query}
        />
      </div>
      {query !== "" && (
        <X
          size={28}
          className="text-gray-600 cursor-pointer "
          onClick={handleClearInput}
        />
      )}
    </div>
  );
};

export default SearchBar;
