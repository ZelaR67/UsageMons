import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface MobileContextType {
  isMobile: boolean;
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  totalSlides: number;
  setTotalSlides: (total: number) => void;
  slideTitles: string[];
  setSlideTitles: (titles: string[]) => void;
}

const MobileContext = createContext<MobileContextType | undefined>(undefined);

export const MobileProvider = ({ children }: { children: ReactNode }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(6); // Default to 6
  const [slideTitles, setSlideTitles] = useState<string[]>(['Overview', 'Moves', 'Build', 'Spreads', 'Teammates', 'Matchups']);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <MobileContext.Provider value={{ isMobile, currentSlide, setCurrentSlide, totalSlides, setTotalSlides, slideTitles, setSlideTitles }}>
      {children}
    </MobileContext.Provider>
  );
};

export const useMobile = () => {
  const context = useContext(MobileContext);
  if (context === undefined) {
    throw new Error('useMobile must be used within a MobileProvider');
  }
  return context;
};
