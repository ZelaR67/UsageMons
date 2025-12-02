import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Format from './pages/Format';
import Pokemon from './pages/Pokemon';
import { SidebarLayout } from './layouts/SidebarLayout';
import { MetadataProvider } from './contexts/MetadataContext';
import { RatingProvider } from './contexts/RatingContext';

function App() {
  return (
    <MetadataProvider>
      <RatingProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <div className="fixed-bg" />
          <div className="min-h-screen text-gray-800 flex flex-col font-sans relative">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route element={<SidebarLayout />}>
                <Route path="/format/:formatId" element={<Format />} />
                <Route path="/format/:formatId/pokemon/:pokemonName" element={<Pokemon />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </RatingProvider>
    </MetadataProvider>
  );
}

export default App;
