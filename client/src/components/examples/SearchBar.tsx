import { SearchBar } from "../SearchBar";

export default function SearchBarExample() {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Basic Search</h3>
        <SearchBar onSearch={(query) => console.log("Search:", query)} />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">With Send Button</h3>
        <SearchBar 
          onSearch={(query) => console.log("Search:", query)}
          showSendButton
          placeholder="Type and press enter or click send..."
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">With Mic Button</h3>
        <SearchBar 
          onSearch={(query) => console.log("Search:", query)}
          showMicButton
          showSendButton
          placeholder="Ask about policies, docs, or how-tos..."
        />
      </div>
    </div>
  );
}