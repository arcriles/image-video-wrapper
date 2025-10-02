import React from 'react';
import ImageUpload from './ImageUpload';

interface WelcomeScreenProps {
  onImageUpload: (file: File) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onImageUpload }) => {
  return (
    <div className="welcome-screen">
      <h2>Start by Uploading an Image</h2>
      <p>
        Choose a photo you want to edit. Once uploaded, you'll be able to provide a text prompt to describe the changes you want to see.
      </p>
      <div>
        <ImageUpload onImageUpload={onImageUpload} />
      </div>
    </div>
  );
};

export default WelcomeScreen;