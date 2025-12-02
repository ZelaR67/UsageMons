import { useState, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFormatRatings } from '../utils/api';
import { useRating } from '../contexts/RatingContext';
import { Sidebar } from '../components/Sidebar';
import { MobileProvider, useMobile } from '../contexts/MobileContext';

const LayoutContent = () => {
  const { isMobile, currentSlide, setCurrentSlide, totalSlides, slideTitles } = useMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const { formatId } = useParams();
  const { rating, setRating } = useRating();

  const { data: availableRatings = [] } = useQuery<number[]>({
    queryKey: ['ratings', formatId],
    queryFn: () => getFormatRatings(formatId!),
    enabled: !!formatId
  });

  // Keyboard navigation
  useEffect(() => {
    if (!isMobile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentSlide(Math.max(0, currentSlide - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide(Math.min(totalSlides - 1, currentSlide + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, currentSlide, totalSlides, setCurrentSlide]);

  if (!isMobile) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-96 p-8">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-gray-900 dark:text-white">
      {/* Mobile Header / Nav */}
      <div className="sticky top-0 z-50 bg-white/5 dark:bg-black/5 backdrop-blur-xl p-4 flex justify-between items-center">
        <div className="font-bold text-lg tracking-wide flex items-center gap-3">
            <span>{slideTitles[currentSlide] || 'Stats'}</span>
            {currentSlide !== 0 && availableRatings.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsRatingOpen(!isRatingOpen)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors outline-none"
                >
                  <span>{rating}</span>
                  <svg 
                    className={`w-3 h-3 transition-transform duration-200 ${isRatingOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isRatingOpen && (
                  <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsRatingOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-24 z-50 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                      <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {availableRatings.map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setRating(r);
                              setIsRatingOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors border-b border-gray-100/50 dark:border-white/5 last:border-0
                              ${r === rating 
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-blue-500/5 hover:text-blue-600 dark:hover:text-blue-400'
                              }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
        </div>
        
        <button 
          onClick={() => setIsMenuOpen(true)}
          className={`p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white focus:outline-none transition-opacity duration-200 ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          {/* Hamburger Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Side Drawer */}
      {/* Overlay */}
      {isMenuOpen && (
        <div 
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 z-[70] w-64 bg-white/20 dark:bg-black/20 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out will-change-transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full overflow-y-auto flex flex-col">
            <div className="p-4 flex justify-end items-center shrink-0">
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            {slideTitles.map((title, idx) => (
                <button
                key={idx}
                onClick={() => {
                    setCurrentSlide(idx);
                    setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-6 py-4 text-sm transition-all border-l-4 ${
                    currentSlide === idx 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-black/5 dark:bg-white/10 font-bold' 
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
                }`}
                >
                {title}
                </button>
            ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <Outlet />
      </div>
      
      {/* Page Indicator */}
      <div className="bg-white/30 dark:bg-black/30 backdrop-blur-md p-2 flex justify-center gap-2">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full transition-colors ${i === currentSlide ? 'bg-blue-500' : 'bg-gray-600'}`}
          />
        ))}
      </div>
    </div>
  );
};

export const SidebarLayout = () => {
  return (
    <MobileProvider>
      <LayoutContent />
    </MobileProvider>
  );
};
