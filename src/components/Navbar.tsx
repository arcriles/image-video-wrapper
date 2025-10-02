import React from 'react';

type View = 'image' | 'video';

interface NavbarProps {
  activeView: View;
  setView: (view: View) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, setView }) => {
  return (
    <nav>
      <div className="nav-container">
        <button
          onClick={() => setView('image')}
          className={activeView === 'image' ? 'active' : 'inactive'}
        >
          Image Editor
        </button>
        <button
          onClick={() => setView('video')}
          className={activeView === 'video' ? 'active' : 'inactive'}
        >
          Video Generator
        </button>
      </div>
    </nav>
  );
};

export default Navbar;