// src/pages/GachaponPage.tsx
import React from 'react';
import GachaMachineSVG from './GachaponMachine';

const GachaponPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex items-center justify-center">
      <div className="relative w-full max-w-5xl aspect-[4/3] flex items-center justify-center">
        <GachaMachineSVG />
      </div>
    </div>
  );
};

export default GachaponPage;
