import React from 'react';
// No CSS import needed as it's in the global index.css

const Header: React.FC = () => {
  return (
    <header>
      <div className="title">
        {/* --- FIX: Title changed and Icon removed --- */}
        <h1>SMDD</h1>
      </div>
      {/* --- FIX: Subtitle changed --- */}
      <p>Remember to Alert Admin changes are complete</p>
    </header>
  );
};

export default Header;