import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Navbar from './components/Navbar';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';

const App: React.FC = () => {
  const [imageForVideo, setImageForVideo] = useState<string | null>(null);

  const handleNavigateToVideo = (imageData: string) => {
    setImageForVideo(imageData);
  };
  
  const handleChangeApiKey = () => {
      localStorage.removeItem('gemini-api-key');
      window.location.reload();
  };

  return (
    <HashRouter>
      <div className="App">
        <Header />
        <Navbar onChangeApiKey={handleChangeApiKey} />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/image" replace />} />
            <Route path="/image" element={<ImageEditor onNavigateToVideo={handleNavigateToVideo} />} />
            <Route path="/video" element={<VideoGenerator initialImage={imageForVideo} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;