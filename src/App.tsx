import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

// Helper function to convert a Blob to a Base64 string
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      resolve(url.split(',')[1]);
    };
    reader.readAsDataURL(blob);
  });
};

// Helper function to download a file
const downloadFile = (url: string, filename: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};


// Main Application Component
const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // On initial load, check for a stored API key
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini-api-key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleKeySubmit = () => {
    if (!keyInput.trim()) {
      setLoginError('API key cannot be empty.');
      return;
    }
    localStorage.setItem('gemini-api-key', keyInput);
    setApiKey(keyInput);
    setLoginError('');
  };

  // If there's no API key, render the login page
  if (!apiKey) {
    return (
      <div className="app-container">
        <div className="form-container">
          <div className="header-text">
            <h1>Enter Your API Key</h1>
            <p>Please provide your Google AI Studio API key to continue.</p>
          </div>
          <div className="input-section">
            <input
              id="api-key-input"
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Enter your API key"
              style={{
                width: '100%',
                backgroundColor: '#353739',
                border: '1px solid #4b5563',
                borderRadius: '0.5rem',
                padding: '1rem',
                color: '#ffffff',
                boxSizing: 'border-box'
              }}
            />
            {loginError && <p id="status"><span className="error-text">{loginError}</span></p>}
          </div>
          <button id="generate-button" onClick={handleKeySubmit}>
            Save and Continue
          </button>
        </div>
      </div>
    );
  }

  // If API key exists, render the main generator UI
  return <GeneratorUI apiKey={apiKey} />;
};


// Generator UI Component
interface GeneratorUIProps {
  apiKey: string;
}

const GeneratorUI: React.FC<GeneratorUIProps> = ({ apiKey }) => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll the log container
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [progressLog]);

  const addToLog = (message: string) => {
    setProgressLog(prevLog => [...prevLog, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generate = async () => {
    if (!prompt.trim()) {
      setProgressLog(['Error: Please enter a prompt to generate a video.']);
      return;
    }
    
    setIsLoading(true);
    setProgressLog([]); // Clear log on new generation
    addToLog('Initializing video generation...');
    setVideoSrc(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      addToLog('API client initialized.');
      const params: any = {
        model: 'veo-3.0-fast-generate-001',
        prompt,
        config: {
          numberOfVideos: 1,
          aspectRatio: '9:16',
        },
      };

      if (image) {
        const imageBytes = await blobToBase64(image);
        params.image = { imageBytes, mimeType: image.type };
        addToLog('Image encoded to Base64.');
      }

      addToLog('Sending request to the model...');
      let operation = await ai.models.generateVideos(params);
      addToLog('Request sent. Now polling for results...');

      let pollCount = 0;
      const maxPolls = 20;
      while (!operation.done && pollCount < maxPolls) {
        pollCount++;
        addToLog(`Polling attempt ${pollCount}/${maxPolls}...`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        try {
          operation = await ai.operations.getVideosOperation({ operation });
        } catch (e) {
          throw new Error('Failed to get video generation status. Please try again.');
        }
      }

      if (!operation.done) {
        throw new Error('Video generation timed out. Please try again with a simpler prompt.');
      }
      addToLog('Generation complete.');

      const videos = operation.response?.generatedVideos;
      if (videos === undefined || videos.length === 0) {
        throw new Error('No videos were generated. The prompt may have been blocked.');
      }

      addToLog('Downloading video...');

      for (let i = 0; i < videos.length; i++) {
        const v = videos[i];
        if (v && v.video && v.video.uri) {
          const url = decodeURIComponent(v.video.uri);
          const res = await fetch(`${url}&key=${apiKey}`);
          const blob = await res.blob();
          const objectURL = URL.createObjectURL(blob);
          downloadFile(objectURL, `video${i}.mp4`);
          setVideoSrc(objectURL);
        } else {
          console.warn(`Skipping invalid video object at index ${i}:`, v);
        }
      }
      addToLog('Download complete.');
    } catch (e: any) {
      let userFriendlyMessage = `Error: ${e.message}`;
      if (typeof e.message === 'string' && (e.message.includes('API_KEY_INVALID') || e.message.includes('API key not valid'))) {
        userFriendlyMessage = 'Error: Your API key is invalid. Clear your browser local storage to enter a new one.';
      }
      addToLog(userFriendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="app-container" role="main">
        <div className="form-container">
          <div className="header-text">
            <h1>Generate videos with Veo</h1>
            <p>Enter a prompt and optional image to generate a video with Veo.</p>
          </div>
          <div className="input-section">
            <textarea
              id="prompt-input"
              rows={4}
              placeholder="Enter a prompt, e.g., 'A cinematic shot of a futuristic city at night'"
              aria-label="Video generation prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            />
            <div>
              <p className="file-input-label-text">Conditioning Image (Optional)</p>
              <div className="file-input-container">
                <label htmlFor="file-input" className={`file-input-button ${isLoading ? 'disabled' : ''}`}>
                  Choose File
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={isLoading}
                />
                <span id="file-name">{image ? image.name : 'No file chosen'}</span>
              </div>
              {imagePreview && (
                <div className="image-preview-container">
                  <img alt="Conditioning image preview" id="img-preview" src={imagePreview} />
                  <button onClick={handleRemoveImage} className="remove-image-btn" title="Remove image">&times;</button>
                </div>
              )}
            </div>
          </div>
          <button id="generate-button" onClick={generate} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
          
          <div className="progress-log-container" ref={logContainerRef}>
            {progressLog.length === 0 && <p>Waiting for generation to start...</p>}
            {progressLog.map((log, index) => (
              <p key={index} style={{ margin: '0 0 4px 0', color: log.startsWith('Error:') ? '#f87171' : 'inherit' }}>
                {log}
              </p>
            ))}
          </div>

          {videoSrc && (
            <div className="video-player-9-16">
              <video id="video" autoPlay loop controls src={videoSrc}></video>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default App;