import React from 'react';

interface HistoryDisplayProps {
  images: string[];
  onSelect: (image: string) => void;
}

const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ images, onSelect }) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="history-container">
      <h3>History</h3>
      <div className="history-thumbnails">
        {images.map((image, index) => (
          <div key={index} className="history-item" onClick={() => onSelect(image)}>
            <img src={image} alt={`Generated ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryDisplay;