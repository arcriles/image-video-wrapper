import React from 'react';
import ImageUpload from './ImageUpload';

interface WelcomeScreenProps {
  onImageUpload: (file: File) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onImageUpload }) => {
  return (
    <div className="welcome-screen">
      <h2>upload image</h2>
      <p>
pilih foto dan mulai prompting :v      </p>
      <div>
        <ImageUpload onImageUpload={onImageUpload} />
      </div>
    </div>
  );
};

export default WelcomeScreen;