import React, { useState } from 'react';
import App from '../App';
import { setApiKey } from '../components/services/geminiService';

const ApiKeyGate: React.FC = () => {
    const [apiKey, setLocalApiKey] = useState<string>('');
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalApiKey(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            setApiKey(apiKey.trim());
            setIsSubmitted(true);
        }
    };

    if (isSubmitted) {
        return <App />;
    }

    return (
        <div className="api-key-gate">
            <h1>Enter Your Gemini API Key</h1>
            <p>
                Your API key is required to use the application and will only be stored in your browser for this session.
            </p>
            <form onSubmit={handleSubmit} className="api-key-form">
                <input
                    type="password"
                    value={apiKey}
                    onChange={handleKeyChange}
                    placeholder="Enter your API key here"
                />
                <button type="submit">Continue</button>
            </form>
        </div>
    );
};

export default ApiKeyGate;