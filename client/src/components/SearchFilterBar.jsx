import { Search, X } from "lucide-react";

const SearchFilterBar = ({
  searchTerm = "",
  onSearchChange,
  placeholder = "Search events...",
  categories = [],
  selectedCategory = "",
  onCategoryChange,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div
        className="
          group
          flex
          items-center
          rounded-2xl
          border
          border-border
          bg-surface-secondary
          px-4
          py-3
          transition-all
          duration-200
          focus-within:border-primary
          focus-within:ring-4
          focus-within:ring-primary/20
          hover:border-primary/50
        "
      >
        <Search
          size={18}
          className="
            shrink-0
            text-text-muted
            transition-colors
            duration-200
            group-focus-within:text-primary
          "
        />

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="
            mx-3
            flex-1
            bg-transparent
            text-sm
            font-medium
            text-text
            outline-none
            placeholder:text-text-muted
          "
        />

        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="
              rounded-full
              p-1
              text-text-muted
              transition-all
              duration-200
              hover:bg-primary/10
              hover:text-primary
              hover:scale-110
            "
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Filter */}
      {categories?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {/* All Categories */}
          <button
            onClick={() => onCategoryChange && onCategoryChange("")}
            className={`
              shrink-0
              rounded-full
              border-2
              px-4
              py-1.5
              text-xs
              font-bold
              transition-all
              duration-200
              ${
                !selectedCategory
                  ? `
                    border-primary
                    bg-primary
                    text-white
                    shadow-lg
                    shadow-primary/30
                    hover:bg-primary-hover
                    hover:scale-[1.02]
                  `
                  : `
                    border-border
                    bg-surface-secondary
                    text-text-muted
                    hover:border-primary/50
                    hover:text-text
                    hover:bg-surface
                  `
              }
            `}
          >
            All Events
          </button>

          {categories.map((cat) => {
            const catId = cat._id || cat.id;
            const selected = selectedCategory === catId;

            return (
              <button
                key={catId}
                onClick={() => onCategoryChange && onCategoryChange(catId)}
                className={`
                  shrink-0
                  rounded-full
                  border-2
                  px-4
                  py-1.5
                  text-xs
                  font-bold
                  transition-all
                  duration-200
                  ${
                    selected
                      ? `
                        border-primary
                        bg-primary
                        text-white
                        shadow-lg
                        shadow-primary/30
                        hover:bg-primary-hover
                        hover:scale-[1.02]
                      `
                      : `
                        border-border
                        bg-surface-secondary
                        text-text-muted
                        hover:border-primary/50
                        hover:text-text
                        hover:bg-surface
                      `
                  }
                `}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchFilterBar;
