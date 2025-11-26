import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Format {
  id: string;
  name: string;
}

export default function Home() {
  const [formats, setFormats] = useState<Format[]>([]);

  useEffect(() => {
    fetch('/api/formats')
      .then(res => res.json())
      .then(data => setFormats(data))
      .catch(err => console.error("Failed to load formats", err));
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 drop-shadow-sm">UsageMons</h1>
      <p className="text-center mb-10 text-gray-600 dark:text-gray-300 font-medium">Select a format to view usage stats and counters.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {formats.map(format => (
          <Link 
            key={format.id}
            to={`/format/${format.id}`}
            className="glass-card p-6 text-center group hover:-translate-y-1"
          >
            <h2 className="text-lg font-bold capitalize text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{format.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
