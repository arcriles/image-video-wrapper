import React from 'react';
// No CSS import needed

type View = 'image' | 'video';

interface NavbarProps {
  activeView: View;
  setView: (view: View) => void;
  onChangeApiKey: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, setView, onChangeApiKey }) => {
  return (
    <nav>
      <div className="nav-container">
        <button
          onClick={() => setView('image')}
          className={`nav-button ${activeView === 'image' ? 'active' : 'inactive'}`}
        >
          Image Editor
        </button>
        <button
          onClick={() => setView('video')}
          className={`nav-button ${activeView === 'video' ? 'active' : 'inactive'}`}
        >
          Video Generator
        </button>
        <button onClick={onChangeApiKey} className="nav-button inactive change-key-button">
          Change Key
        </button>
      </div>
    </nav>
  );
};

export default Navbar;