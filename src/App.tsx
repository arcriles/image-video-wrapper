import React, { useState } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';

type View = 'image' | 'video';

const App: React.FC = () => {
  const [view, setView] = useState<View>('image');
  const [imageForVideo, setImageForVideo] = useState<string | null>(null);

  const handleSetView = (newView: View) => {
    if (view === 'video' && newView !== 'video') {
      setImageForVideo(null);
    }
    setView(newView);
  };

  const handleNavigateToVideo = (imageData: string) => {
    setImageForVideo(imageData);
    setView('video');
  };

  return (
    <div className="App">
      <Header />
      <Navbar activeView={view} setView={handleSetView} />
      <main>
        {view === 'image' && <ImageEditor onNavigateToVideo={handleNavigateToVideo} />}
        {view === 'video' && <VideoGenerator initialImage={imageForVideo} />}
      </main>
    </div>
  );
};

export default App;