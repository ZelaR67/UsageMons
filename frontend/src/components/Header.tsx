import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getFormats } from '../utils/api';

interface Format {
  id: string;
  name: string;
}

export default function Header() {
  const [formats, setFormats] = useState<Format[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const { formatId } = useParams();

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    getFormats()
      .then(data => setFormats(data))
      .catch(err => console.error("Failed to load formats", err));
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setDarkMode(true);
    }
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value;
    if (newFormat) {
      navigate(`/format/${newFormat}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/30 border-b border-white/40 shadow-sm dark:bg-black/30 dark:border-white/10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors text-xl"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-purple-600 hover:opacity-80 transition-opacity dark:from-blue-400 dark:to-purple-400">
            UsageMons
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <select 
            value={formatId || ''} 
            onChange={handleFormatChange}
            className="glass-input text-gray-800 font-medium cursor-pointer dark:text-gray-200"
          >
            <option value="" disabled>Select Format</option>
            {formats.map(fmt => (
              <option key={fmt.id} value={fmt.id}>{fmt.name}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
