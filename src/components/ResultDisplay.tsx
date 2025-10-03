import React from 'react';
import Spinner from './Spinner';

interface ResultDisplayProps {
  originalImages: string[];
  editedImage: string | null;
  isLoading: boolean;
  onDownloadClick: (type: 'original' | 'edited') => void;
  onRemoveImage: (index: number) => void;
  onAddReferenceClick: () => void;
  showTimestampInputFor: 'original' | 'edited' | null;
  onTimestampSubmit: (timestamp: string) => void;
  timestamp: string;
  setTimestamp: (value: string) => void;
}

const TimestampInput: React.FC<{
    onSubmit: (timestamp: string) => void;
    timestamp: string;
    setTimestamp: (value: string) => void;
}> = ({ onSubmit, timestamp, setTimestamp }) => (
    <form className="timestamp-form active" onSubmit={(e) => { e.preventDefault(); onSubmit(timestamp); }}>
        <input 
            type="text" 
            value={timestamp} 
            onChange={(e) => setTimestamp(e.target.value)} 
            placeholder="Enter timestamp..." 
            autoFocus 
        />
        <button type="submit">Confirm</button>
    </form>
);


const OriginalImageContainer: React.FC<{
  images: string[];
  onRemoveImage: (index: number) => void;
  onAddReference: () => void;
  onDownloadClick: () => void;
  showInput: boolean;
  onSubmit: (timestamp: string) => void;
  timestamp: string;
  setTimestamp: (value: string) => void;
}> = ({ images, onRemoveImage, onAddReference, onDownloadClick, showInput, onSubmit, timestamp, setTimestamp }) => (
  <div className="image-container">
    <div className="image-header">
      <h2>Original</h2>
      <div className="header-buttons">
        <button onClick={onAddReference} className="action-button">Add Ref</button>
        <button onClick={onDownloadClick} className="download-button">Download</button>
      </div>
    </div>
    {showInput && <TimestampInput onSubmit={onSubmit} timestamp={timestamp} setTimestamp={setTimestamp} />}
    <div className="image-box">
      {images.length > 0 && 
        <div className="thumbnail-wrapper">
          <img src={images[0]} alt="Original" />
          <button className="thumbnail-remove-button" onClick={() => onRemoveImage(0)}>×</button>
        </div>
      }
    </div>
    {images.length > 1 && (
      <div className="reference-thumbnails">
        {images.slice(1).map((img, index) => (
          <div key={index} className="thumbnail-wrapper">
            <img src={img} alt={`Reference ${index + 1}`} className="thumbnail" />
            <button className="thumbnail-remove-button" onClick={() => onRemoveImage(index + 1)}>×</button>
          </div>
        ))}
      </div>
    )}
  </div>
);

const EditedImageContainer: React.FC<{
  imageUrl: string | null;
  isLoading: boolean;
  onDownloadClick: () => void;
  showInput: boolean;
  onSubmit: (timestamp: string) => void;
  timestamp: string;
  setTimestamp: (value: string) => void;
}> = ({ imageUrl, isLoading, onDownloadClick, showInput, onSubmit, timestamp, setTimestamp }) => (
  <div className="image-container">
    <div className="image-header">
      <h2>Edited</h2>
      <div className="header-buttons">
        {imageUrl && !isLoading && (
          <button onClick={onDownloadClick} className="download-button">Download</button>
        )}
      </div>
    </div>
    {showInput && <TimestampInput onSubmit={onSubmit} timestamp={timestamp} setTimestamp={setTimestamp} />}
    <div className="image-box">
      {isLoading ? (
        <div className="loading">
          <Spinner />
          <span>Editing in progress...</span>
        </div>
      ) : imageUrl ? (
        <img src={imageUrl} alt="Edited" />
      ) : (
        <div className="placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
    </div>
  </div>
);

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  originalImages,
  editedImage,
  isLoading,
  onDownloadClick,
  onRemoveImage,
  onAddReferenceClick,
  showTimestampInputFor,
  onTimestampSubmit,
  timestamp,
  setTimestamp,
}) => {
  return (
    <div className="result-display">
      <OriginalImageContainer
        images={originalImages}
        onRemoveImage={onRemoveImage}
        onAddReference={onAddReferenceClick}
        onDownloadClick={() => onDownloadClick('original')}
        showInput={showTimestampInputFor === 'original'}
        onSubmit={onTimestampSubmit}
        timestamp={timestamp}
        setTimestamp={setTimestamp}
      />
      <div className="arrow">→</div>
      <EditedImageContainer
        imageUrl={editedImage}
        isLoading={isLoading}
        onDownloadClick={() => onDownloadClick('edited')}
        showInput={showTimestampInputFor === 'edited'}
        onSubmit={onTimestampSubmit}
        timestamp={timestamp}
        setTimestamp={setTimestamp}
      />
    </div>
  );
};

export default ResultDisplay;