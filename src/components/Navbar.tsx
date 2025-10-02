import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavbarProps {
  onChangeApiKey: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onChangeApiKey }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const activeView = location.pathname === '/video' ? 'video' : 'image';

  return (
    <nav>
      <div className="nav-container">
        <button
          onClick={() => navigate('/image')}
          className={`nav-button ${activeView === 'image' ? 'active' : 'inactive'}`}
        >
          Image Editor
        </button>
        <button
          onClick={() => navigate('/video')}
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