import React from 'react';
import Spinner from './Spinner';

interface ResultDisplayProps {
  originalImage: string | null;
  editedImage: string | null;
  isLoading: boolean;
  onDownload: () => void;
  onRemove: () => void;
}

const ImageContainer: React.FC<{
  title: string;
  imageUrl: string | null;
  isLoading?: boolean;
  onDownload?: () => void;
  onRemove?: () => void;
}> = ({ title, imageUrl, isLoading = false, onDownload, onRemove }) => (
  <div className="image-container">
    <div className="image-header">
        <h2>{title}</h2>
        <div className="header-buttons">
            {onRemove && (
                <button onClick={onRemove} className="remove-button">Remove</button>
            )}
            {onDownload && imageUrl && !isLoading && (
                <button onClick={onDownload} className="download-button">Download</button>
            )}
        </div>
    </div>
    <div className="image-box">
      {isLoading ? (
        <div className="loading">
          <Spinner />
          <span>Editing in progress...</span>
        </div>
      ) : imageUrl ? (
        <img src={imageUrl} alt={title} />
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
  originalImage,
  editedImage,
  isLoading,
  onDownload,
  onRemove,
}) => {
  return (
    <div className="result-display">
      <ImageContainer title="Original" imageUrl={originalImage} onRemove={onRemove} />
      <div className="arrow">→</div>
      <ImageContainer
        title="Edited"
        imageUrl={editedImage}
        isLoading={isLoading}
        onDownload={onDownload}
      />
    </div>
  );
};

export default ResultDisplay;