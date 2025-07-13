import React from 'react';
import './../styles.css';

const Footer = () => {
  return (
    <footer className='footer-style'>
      <div className='footer-content'>
        <p>
          &copy;{' '}
          <a href='https://www.freecodecamp.org' target='_blank'>
            freeCodeCamp Summer Hackathon 2025 | mint-sytax team
          </a>
        </p>
        <div className='social-icons'>
          <a
            href='https://github.com/freeCodeCamp-2025-Summer-Hackathon/mint-syntax'
            target='_blank'
            aria-label='GitHub'
            className='social-link'
          >
            <svg
              fill='currentColor'
              viewBox='0 0 24 24'
              aria-hidden='true'
              className='h-6 w-6'
            >
              <path
                fillRule='evenodd'
                d='M12 2C6.477 2 2 6.477 2 12c0 4.419 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.007-.867-.011-1.702-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.007.07 1.532 1.03 1.532 1.03.893 1.53 2.344 1.087 2.91.83.091-.645.35-1.087.636-1.337-2.22-.253-4.555-1.11-4.555-4.943 0-1.09.39-1.984 1.03-2.682-.104-.253-.448-1.27.098-2.659 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.704.113 2.504.337 1.909-1.295 2.747-1.025 2.747-1.025.546 1.389.202 2.406.098 2.659.64.698 1.029 1.592 1.029 2.682 0 3.84-2.339 4.685-4.566 4.935.359.309.678.92.678 1.855 0 1.337-.012 2.419-.012 2.747 0 .268.18.579.688.481C21.137 20.166 24 16.419 24 12c0-5.523-4.477-10-10-10z'
                clipRule='evenodd'
              />
            </svg>
          </a>
        </div>
        <a href='#top' className='back-to-top'>
          Back to Top
        </a>
      </div>
    </footer>
  );
};

export default Footer;
