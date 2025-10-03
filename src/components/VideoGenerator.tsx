import React, { useState, useEffect, useCallback } from 'react';
import ImageUpload from './ImageUpload';
import Spinner from './Spinner';
import { generateVideoWithVeo } from '../components/services/geminiService';

interface VideoGeneratorProps {
  initialImage: string | null;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ initialImage }) => {
  const [sourceImage, setSourceImage] = useState<{ data: string; mime: string; base64: string } | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showTimestampInputFor, setShowTimestampInputFor] = useState<'video' | 'image' | 'all' | null>(null);
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    if (initialImage) {
      const [header, base64] = initialImage.split(',');
      const mimeMatch = header.match(/:(.*?);/);
      if (mimeMatch && mimeMatch[1]) {
        setSourceImage({ data: initialImage, mime: mimeMatch[1], base64 });
        setVideoUrl(null);
        setError(null);
      } else {
        setError("Could not process the image provided from the editor.");
      }
    }
  }, [initialImage]);

  const handleImageUpload = useCallback((files: FileList) => {
    if (files.length === 0) return;
    const file = files[0];
    setError(null);
    setVideoUrl(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      setSourceImage({ data: dataUrl, mime: file.type, base64 });
    };
    reader.onerror = () => {
      setError('Failed to read the image file.');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleProgress = (message: string) => {
    setLoadingMessage(message);
  };

  const handleSubmit = async () => {
    if (!sourceImage || !prompt) {
      setError("Please provide an image and a prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    try {
      const url = await generateVideoWithVeo(
        sourceImage.base64,
        sourceImage.mime,
        prompt,
        handleProgress
      );
      setVideoUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleReset = () => {
    setSourceImage(null);
    setVideoUrl(null);
    setPrompt('');
    setError(null);
    setIsLoading(false);
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
      if (sourceImage) {
        setTimeout(() => downloadFile(sourceImage.data, `source_image_${startTime}.png`), 0);
      }
      if (videoUrl) {
        setTimeout(() => downloadFile(videoUrl, `output_video_${startTime}.mp4`), 500);
      }
    } else if (showTimestampInputFor === 'video' && videoUrl) {
      downloadFile(videoUrl, `output_video_${startTime}.mp4`);
    } else if (showTimestampInputFor === 'image' && sourceImage) {
      downloadFile(sourceImage.data, `source_image_${startTime}.png`);
    }

    setShowTimestampInputFor(null);
    setTimestamp('');
  };
  
  const TimestampInput: React.FC = () => (
    <form className="timestamp-form active" onSubmit={(e) => { e.preventDefault(); executeDownload(timestamp); }}>
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


  if (!sourceImage) {
    return (
      <div className="welcome-screen">
        <h2>Create a Video From an Image</h2>
        <p>
          Upload a starting image for your video. You can then write a prompt to animate it.
        </p>
        <div>
          <ImageUpload onImageUpload={handleImageUpload} />
        </div>
      </div>
    );
  }

  return (
    <div className="video-generator-container">
      <div className="video-controls">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'a cinematic aerial shot, the car is driving through a beautiful mountain landscape'"
          disabled={isLoading}
        />
        <div className="buttons">
          <button onClick={handleReset} disabled={isLoading} className="reset">
            Use New Image
          </button>
          <button onClick={handleSubmit} disabled={isLoading || !prompt.trim()} className="submit">
            {isLoading ? <><Spinner /> Generating...</> : 'Generate Video'}
          </button>
        </div>
      </div>
       {error && (
            <div className="error-message">
                <p><span>Error:</span> {error}</p>
            </div>
        )}
      <div className="video-display">
        <div className="video-container">
          <div className="image-header">
            <h2>Source Image</h2>
            <div className="header-buttons">
                <button onClick={() => setShowTimestampInputFor('image')} className="download-button">Download</button>
                <button onClick={handleReset} className="remove-button">Remove</button>
            </div>
          </div>
          {showTimestampInputFor === 'image' && <TimestampInput />}
          <div className="video-box">
             <img src={sourceImage.data} alt="Source for video" />
          </div>
        </div>
        <div className="arrow">→</div>
        <div className="video-container">
          <div className="image-header">
            <h2>Generated Video</h2>
            <div className="header-buttons">
                {videoUrl && !isLoading && (
                    <button onClick={() => setShowTimestampInputFor('video')} className="download-button">Download</button>
                )}
            </div>
          </div>
          {showTimestampInputFor === 'video' && <TimestampInput />}
          <div className="video-box">
             {isLoading ? (
                <div className="loading">
                    <Spinner />
                    <span>{loadingMessage || 'Initializing...'}</span>
                </div>
             ) : videoUrl ? (
                <video src={videoUrl} controls autoPlay loop />
             ) : (
                <div className="placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.55a2.5 2.5 0 010 4.09L15 18M5 8h8a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2z" /></svg>
                    <span>Video will appear here</span>
                </div>
             )}
          </div>
        </div>
      </div>
      {videoUrl && !isLoading && (
          <div className="action-buttons-container-vertical">
              <button onClick={() => setShowTimestampInputFor('all')} className="action-button download-all-button">
                Download All
              </button>
              {showTimestampInputFor === 'all' && <TimestampInput />}
          </div>
      )}
    </div>
  );
};

export default VideoGenerator;