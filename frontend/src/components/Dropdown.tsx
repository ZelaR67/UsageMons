import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
  customLabel?: React.ReactNode;
}

interface DropdownProps {
  label?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({ 
  label, 
  value, 
  options, 
  onChange, 
  placeholder = "Select...",
  searchable = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setSearchTerm(""), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const filteredOptions = searchable 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      
      {isOpen && searchable ? (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/40 border border-blue-500/50 dark:border-blue-400/50 text-left text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all backdrop-blur-sm font-medium placeholder-gray-500 dark:placeholder-gray-400 pr-8"
            placeholder={selectedOption ? selectedOption.label : placeholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400 text-xs pointer-events-none">▲</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/40 border border-gray-200/50 dark:border-white/10 text-left text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all backdrop-blur-sm hover:bg-white/60 dark:hover:bg-black/50 font-medium flex justify-between items-center group"
        >
          <span className={`truncate ${!selectedOption ? 'text-gray-500 dark:text-gray-400' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors text-xs ml-2">▼</span>
        </button>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-fade-in">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 cursor-pointer transition-colors text-sm font-medium border-b border-gray-100/50 dark:border-white/5 last:border-0
                    ${option.value === value 
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-blue-500/5 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                >
                  {option.customLabel || option.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-sm text-gray-500 dark:text-gray-400 text-center italic">
                No matches found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
