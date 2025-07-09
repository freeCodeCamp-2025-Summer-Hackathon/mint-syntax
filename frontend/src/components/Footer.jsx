import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-style">
      <div className="footer-content">
        <p>
          &copy;{' '}
          <a
            href="https://www.freecodecamp.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Free Code Camp
          </a>{' '}
          2025 Summer Hackathon
        </p>

        <div className="social-icons">
          <a
            href="https://github.com/freeCodeCamp-2025-Summer-Hackathon/mint-syntax"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="social-link"
          >
            <svg
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-6 w-6"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.477..."
              />
            </svg>
          </a>
        </div>

        <a href="#top" className="back-to-top">
          Back to Top
        </a>
      </div>
    </footer>
  );
}