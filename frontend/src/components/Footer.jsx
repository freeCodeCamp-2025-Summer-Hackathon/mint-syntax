import { GitHubIcon } from './Icons/GitHubIcon';

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
            <GitHubIcon />
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
