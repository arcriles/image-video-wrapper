import React from 'react';
import Spinner from './Spinner';

interface EditControlsProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  isLoading: boolean;
}

const EditControls: React.FC<EditControlsProps> = ({
  prompt,
  onPromptChange,
  onSubmit,
  onReset,
  isLoading,
}) => {
  const isSubmitDisabled = isLoading || !prompt.trim();

  return (
    <div className="edit-controls">
      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="e.g., 'add a birthday hat on the cat' or 'make the sky look like a vibrant sunset'"
        disabled={isLoading}
      />
      <div className="buttons">
        <button
          onClick={onReset}
          disabled={isLoading}
          className="reset"
        >
          Upload New Image
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className="submit"
        >
          {isLoading ? (
            <>
              <Spinner />
              Editing...
            </>
          ) : (
            'Generate Edit'
          )}
        </button>
      </div>
    </div>
  );
};

export default EditControls;