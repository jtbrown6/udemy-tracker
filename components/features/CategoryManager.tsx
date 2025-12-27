import React, { useState, useMemo } from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';

interface CategoryManagerProps {
  value: string;
  categories: string[];
  onChange: (category: string) => void;
  categoryCounts?: { [key: string]: number };
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  value, 
  categories, 
  onChange,
  categoryCounts = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    return categories.filter(c => 
      c.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleSelect = (category: string) => {
    onChange(category);
    setIsOpen(false);
    setSearchQuery('');
    setIsCreatingNew(false);
  };

  const handleCreateNew = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      onChange(newCategory.trim());
      setNewCategory('');
      setIsCreatingNew(false);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
      
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-between"
      >
        <span>{value || 'Select category...'}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-700">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          {/* Category List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelect(cat)}
                className="w-full px-3 py-2 text-left hover:bg-slate-700 transition-colors flex items-center justify-between group"
              >
                <span className="flex items-center gap-2 text-sm text-white">
                  {cat === value && <Check size={14} className="text-indigo-400" />}
                  {cat}
                </span>
                {categoryCounts[cat] && (
                  <span className="text-xs text-slate-500 group-hover:text-slate-400">
                    {categoryCounts[cat]}
                  </span>
                )}
              </button>
            ))}

            {filteredCategories.length === 0 && !isCreatingNew && (
              <div className="px-3 py-2 text-sm text-slate-400">
                No categories found
              </div>
            )}
          </div>

          {/* Create New Category */}
          <div className="border-t border-slate-700 p-2">
            {!isCreatingNew ? (
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="w-full px-3 py-2 text-left text-sm text-indigo-400 hover:bg-slate-700 rounded flex items-center gap-2 transition-colors"
              >
                <Plus size={14} />
                Create New Category
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateNew();
                    } else if (e.key === 'Escape') {
                      setIsCreatingNew(false);
                      setNewCategory('');
                    }
                  }}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsOpen(false);
            setIsCreatingNew(false);
            setSearchQuery('');
          }}
        />
      )}
    </div>
  );
};

