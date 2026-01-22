import { useEffect, useState, useRef } from "react";
import { categoryService } from "../../Service/categoryService";

import type { Categorys } from "../../type/categotry/CategoryHeader";

const Header = () => {
  const [categories, setCategories] = useState<Categorys[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    categoryService
      .getCategoryTree()
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

  const handleMouseEnter = (catId: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveCategory(catId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 50);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center">
              <div className="bg-red-600 text-white font-bold px-3 py-2 text-xl">
                UNIQLO
              </div>
            </a>
          </div>
          <nav className="flex-1 flex justify-center">
            <ul className="flex items-center space-x-12">
              {categories.map((cat) => (
                <CategoryItem
                  key={cat.categoryId}
                  category={cat}
                  isActive={activeCategory === cat.categoryId}
                  onMouseEnter={() => handleMouseEnter(cat.categoryId)}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </ul>
          </nav>

          <div className="flex items-center space-x-6">
            <button className="hover:opacity-70 transition-opacity">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </button>
            <button className="hover:opacity-70 transition-opacity">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
            <button className="hover:opacity-70 transition-opacity relative">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const CategoryItem = ({
  category,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: {
  category: Categorys;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  return (
    <li
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <a
        href={`/category/${category.categoryId}`}
        className="text-sm font-medium uppercase tracking-wide hover:opacity-70 transition-opacity block py-2"
      >
        {category.categoryName}
      </a>

      {category.children && category.children.length > 0 && isActive && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
          <div className="bg-white shadow-lg rounded-lg min-w-[200px] py-4 px-2">
            <ul className="space-y-2">
              {category.children.map((child) => (
                <SubCategoryItem key={child.categoryId} category={child} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
};

const SubCategoryItem = ({ category }: { category: Categorys }) => {
  const [showNested, setShowNested] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowNested(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowNested(false);
    }, 100); // Delay 300ms
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <li
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a
        href={`/category/${category.categoryId}`}
        className="block px-4 py-2 text-sm hover:bg-gray-50 rounded transition-colors"
      >
        {category.categoryName}
        {category.children && category.children.length > 0 && (
          <span className="float-right">›</span>
        )}
      </a>

      {/* Nested Dropdown */}
      {category.children && category.children.length > 0 && showNested && (
        <div className="absolute left-full top-0 ml-2">
          <div className="bg-white shadow-lg rounded-lg min-w-[200px] py-4 px-2">
            <ul className="space-y-2">
              {category.children.map((child) => (
                <SubCategoryItem key={child.categoryId} category={child} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
};

export default Header;
