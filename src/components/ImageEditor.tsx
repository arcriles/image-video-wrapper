import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { editImageWithNanoBanana } from '../components/services/geminiService';
import ResultDisplay from './ResultDisplay';
import EditControls from './EditControls';
import WelcomeScreen from './WelcomeScreen';
import HistoryDisplay from './HistoryDisplay';

interface UploadedImage {
  file: File;
  base64: string;
}

interface ImageEditorProps {
  onNavigateToVideo: (imageData: string) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ onNavigateToVideo }) => {
  const navigate = useNavigate();
  const [originalImages, setOriginalImages] = useState<UploadedImage[]>([]);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTimestampInputFor, setShowTimestampInputFor] = useState<'original' | 'edited' | 'all' | null>(null);
  const [timestamp, setTimestamp] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const handleImageUpload = useCallback((files: FileList) => {
    setError(null);
    setEditedImage(null);
    const newImageFiles: UploadedImage[] = [];
    const fileArray = Array.from(files);
    let filesProcessed = 0;

    if (fileArray.length === 0) return;

    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImageFiles.push({
          file,
          base64: (reader.result as string).split(',')[1],
        });
        filesProcessed++;
        if (filesProcessed === fileArray.length) {
          setOriginalImages(prevImages => [...prevImages, ...newImageFiles]);
        }
      };
      reader.onerror = () => {
        setError('Failed to read an image file.');
        filesProcessed++;
        if (filesProcessed === fileArray.length) {
          setOriginalImages(prevImages => [...prevImages, ...newImageFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (originalImages.length === 0 || !prompt) {
      setError('Please upload at least one image and provide an editing prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    try {
      const result = await editImageWithNanoBanana(
        originalImages.map(img => img.base64),
        originalImages[0].file.type,
        prompt
      );
      setEditedImage(result);
      setHistory(prev => [result, ...prev]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImages, prompt]);

  const handleReset = useCallback(() => {
    setOriginalImages([]);
    setEditedImage(null);
    setPrompt('');
    setError(null);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);
  
  const handleRemoveImage = useCallback((indexToRemove: number) => {
    setOriginalImages(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleAddReferenceClick = () => {
    fileInputRef.current?.click();
  };

  const executeDownload = (startTime: string) => {
    if (!showTimestampInputFor || !startTime) return;

    const downloadFile = (url: string, filename: string) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (showTimestampInputFor === 'all') {
      originalImages.forEach((img, index) => {
        const imageUrl = `data:${img.file.type};base64,${img.base64}`;
        const filename = `original_image_${index + 1}_${startTime}.png`;
        setTimeout(() => downloadFile(imageUrl, filename), index * 500);
      });

      if (editedImage) {
        const filename = `edited_image_${startTime}.png`;
        setTimeout(() => downloadFile(editedImage, filename), originalImages.length * 500);
      }
    } else {
      let imageUrl: string | null = null;
      let filename = "";

      if (showTimestampInputFor === 'edited' && editedImage) {
        imageUrl = editedImage;
        filename = `output_image_${startTime}.png`;
      } else if (showTimestampInputFor === 'original' && originalImages.length > 0) {
        imageUrl = `data:${originalImages[0].file.type};base64,${originalImages[0].base64}`;
        filename = `original_image_${startTime}.png`;
      }

      if (imageUrl) {
        downloadFile(imageUrl, filename);
      }
    }

    setShowTimestampInputFor(null);
    setTimestamp('');
  };

  const handleDownloadClick = (type: 'original' | 'edited') => {
    setShowTimestampInputFor(type);
  };

  const handleSelectFromHistory = (image: string) => {
    setEditedImage(image);
  };

  return (
    <div className="editor-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
        multiple
        accept="image/png, image/jpeg, image/webp"
        style={{ display: 'none' }}
      />
      {originalImages.length === 0 ? (
        <WelcomeScreen onImageUpload={handleImageUpload} />
      ) : (
        <>
          <EditControls
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={handleSubmit}
            onReset={handleReset}
            isLoading={isLoading}
          />
          <ResultDisplay
            originalImages={originalImages.map(img => `data:${img.file.type};base64,${img.base64}`)}
            editedImage={editedImage}
            isLoading={isLoading}
            onDownloadClick={handleDownloadClick}
            onRemoveImage={handleRemoveImage}
            onAddReferenceClick={handleAddReferenceClick}
            showTimestampInputFor={showTimestampInputFor === 'all' ? null : showTimestampInputFor}
            onTimestampSubmit={executeDownload}
            timestamp={timestamp}
            setTimestamp={setTimestamp}
          />
          {editedImage && !isLoading && (
            <div className="action-buttons-container-vertical">
              <button
                onClick={() => {
                  onNavigateToVideo(editedImage);
                  navigate('/video');
                }}
                className="action-button create-video-button"
              >
                ✨ Create Video
              </button>
              <button onClick={() => setShowTimestampInputFor('all')} className="action-button download-all-button">
                Download All
              </button>
              {showTimestampInputFor === 'all' && (
                <form className="timestamp-form active" onSubmit={(e) => { e.preventDefault(); executeDownload(timestamp); }}>
                  <input type="text" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} placeholder="Enter timestamp..." autoFocus />
                  <button type="submit">Confirm Download</button>
                </form>
              )}
            </div>
          )}
        </>
      )}
      <HistoryDisplay images={history} onSelect={handleSelectFromHistory} />
    </div>
  );
};

export default ImageEditor;