import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFormats } from '../utils/api';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const formats = await getFormats();
        if (formats && formats.length > 0) {
          // formats are already sorted by total_battles desc from the API
          navigate(`/format/${formats[0].id}`, { replace: true });
        } else {
          navigate('/format/gen9ou', { replace: true });
        }
      } catch (error) {
        console.error('Failed to fetch formats:', error);
        navigate('/format/gen9ou', { replace: true });
      }
    };

    fetchAndRedirect();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      Loading formats...
    </div>
  );
};

export default Home;
