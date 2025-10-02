import React from 'react';

const BananaIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="banana-icon"
  >
    <path
      d="M19.04,11.02c-1.12-2.4-2.83-4.22-5.04-5.02C12.01,5.2,10.02,6,8.98,8.04C6.58,9.16,4.76,10.87,3.98,13.08
	c-0.8,2.21,0,4.2,1.96,5.24c2.4,1.12,4.22,2.83,5.02,5.04c0.8,2.21,2.79,3,4.82,2.04c2.4-1.12,4.22-2.83,5.02-5.04
	C21.6,18.13,20.8,16.14,19.04,11.02z"
    />
  </svg>
);

const Header: React.FC = () => {
  return (
    <header>
      <div className="title">
        <BananaIcon />
        <h1>Nano Banana Editor</h1>
      </div>
      <p>
        Edit your images with the power of AI. Just upload, describe, and see the magic happen.
      </p>
    </header>
  );
};

export default Header;