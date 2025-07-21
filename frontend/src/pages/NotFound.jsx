import { Link } from 'react-router';
import NotFoundImage from '../assets/404.svg';

const NotFound = () => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: 'var(--spacing-lg)',
        marginTop: 'var(--spacing-lg)',
        backgroundColor: 'var(--palette-accent-white)',
        borderRadius: 'var(--border-radius-md)',
        boxShadow: 'var(--shadow-sm)',
        maxWidth: '600px',
        margin: 'var(--spacing-lg) auto',
      }}
    >
      <img
        src={NotFoundImage}
        alt='404 Not Found'
        style={{
          maxWidth: '90%',
          height: 'auto',
          display: 'block',
          margin: 'var(--spacing-lg) auto var(--spacing-md) auto',
        }}
      />

      <Link
        to='/'
        className='not-found-button'
        style={{ marginTop: 'var(--spacing-md)' }}
      >
        Go to Home Page
      </Link>
    </div>
  );
};

export default NotFound;
