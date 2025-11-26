import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RatingContextType {
  rating: number | null;
  setRating: (rating: number | null) => void;
}

const RatingContext = createContext<RatingContextType | undefined>(undefined);

export const RatingProvider = ({ children }: { children: ReactNode }) => {
  const [rating, setRating] = useState<number | null>(null);

  return (
    <RatingContext.Provider value={{ rating, setRating }}>
      {children}
    </RatingContext.Provider>
  );
};

export const useRating = () => {
  const context = useContext(RatingContext);
  if (context === undefined) {
    throw new Error('useRating must be used within a RatingProvider');
  }
  return context;
};
