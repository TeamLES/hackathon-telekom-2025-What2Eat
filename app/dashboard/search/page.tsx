export default function SearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-muted-foreground">Search for recipes, ingredients, or meal ideas</p>
      </div>

      <div className="relative">
        <input
          type="search"
          placeholder="Search recipes, ingredients..."
          className="w-full px-4 py-3 pl-10 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className="text-center py-12 text-muted-foreground">
        <p>Start typing to search for recipes...</p>
      </div>
    </div>
  );
}
