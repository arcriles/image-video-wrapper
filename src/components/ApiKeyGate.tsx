import React, { useState, useEffect } from 'react';
import App from '../App';
import { setApiKey } from '../components/services/geminiService';

const API_KEY_STORAGE_KEY = 'gemini-api-key';

const ApiKeyGate: React.FC = () => {
    // State to hold the key value for the input form
    const [inputValue, setInputValue] = useState<string>('');
    // State to track if the key has been successfully initialized
    const [isKeyInitialized, setIsKeyInitialized] = useState<boolean>(false);

    useEffect(() => {
        // Try to load and initialize from storage on first render
        const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (storedApiKey) {
            setApiKey(storedApiKey); // Initialize the service with the stored key
            setIsKeyInitialized(true); // Mark as initialized to render the App
        }
    }, []); // The empty array ensures this effect runs only once on mount

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedKey = inputValue.trim();
        if (trimmedKey) {
            localStorage.setItem(API_KEY_STORAGE_KEY, trimmedKey); // Save to storage
            setApiKey(trimmedKey); // Initialize the service with the new key
            setIsKeyInitialized(true); // Mark as initialized to render the App
        }
    };

    // If the key is initialized (either from storage or form), show the main app
    if (isKeyInitialized) {
        return <App />;
    }

    // Otherwise, show the input form to get the key
    return (
        <div className="api-key-gate">
            <h1>Enter Your Gemini API Key</h1>
            <p>
                Your API key is required to use the application. It will be saved in your browser's local storage for future visits.
            </p>
            <form onSubmit={handleSubmit} className="api-key-form">
                <input
                    type="password"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter your API key here"
                />
                <button type="submit">Continue</button>
            </form>
        </div>
    );
};

export default ApiKeyGate;