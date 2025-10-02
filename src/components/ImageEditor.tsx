import React, { useState, useCallback } from 'react';
import { editImageWithNanoBanana } from '../components/services/geminiService';
import ResultDisplay from './ResultDisplay';
import EditControls from './EditControls';
import WelcomeScreen from './WelcomeScreen';

interface UploadedImage {
  file: File;
  base64: string;
}

interface ImageEditorProps {
    onNavigateToVideo: (imageData: string) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ onNavigateToVideo }) => {
  const [originalImage, setOriginalImage] = useState<UploadedImage | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((file: File) => {
    setError(null);
    setEditedImage(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImage({
        file,
        base64: (reader.result as string).split(',')[1],
      });
    };
    reader.onerror = () => {
      setError('Failed to read the image file.');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!originalImage || !prompt) {
      setError('Please upload an image and provide an editing prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const result = await editImageWithNanoBanana(
        originalImage.base64,
        originalImage.file.type,
        prompt
      );
      setEditedImage(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt]);

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setEditedImage(null);
    setPrompt('');
    setError(null);
    setIsLoading(false);
  }, []);

  return (
    <div className="image-editor">
      {!originalImage ? (
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
          {error && (
            <div className="error-message">
              <p><span>Error:</span> {error}</p>
            </div>
          )}
          <ResultDisplay
            originalImage={`data:${originalImage.file.type};base64,${originalImage.base64}`}
            editedImage={editedImage}
            isLoading={isLoading}
          />
          {editedImage && !isLoading && (
            <div>
                 <button
                    onClick={() => onNavigateToVideo(editedImage)}
                    className="create-video-button"
                 >
                    ✨ Create Video From Edited Image
                </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImageEditor;