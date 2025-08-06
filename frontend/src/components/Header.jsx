import { useRef } from 'react';
import { Link } from 'react-router';
import { useUser } from '../hooks/useUser';
import LoginForm from './LoginForm';
import ScrollToHashElement from './ScrollToHashElement';
import IdeaForgeLogo from '../assets/Idea-Forge-logo.svg';
import { ChevronIcon } from './Icons/ChevronIcon';
import { ActionButton } from './Buttons';

const Header = () => {
  const dialogRef = useRef();
  const { isLogged, logout, userState, isAdmin } = useUser();

  const adminLinks = isAdmin
    ? [
        { to: '/users', text: 'Manage Users' },
        { to: '/users/add', text: 'Add User' },
      ]
    : [];

  const links = [
    ...adminLinks,
    { to: '/me', text: 'My Profile' },
    { to: '/me/ideas', text: 'My Ideas' },
    { to: '/me/edit', text: 'Edit Profile' },
    { to: '/logout', text: 'Logout', onClick: logout },
  ];

  return (
    <header className='header-style'>
      <ScrollToHashElement />
      <div className='header-banner-content'>
        <div className='logo-area left-logo'>
          <img
            src={IdeaForgeLogo}
            alt='Idea-Forge Logo New'
            className='logo-img'
          />
        </div>
        <div className='header-center-content'>
          <nav className='navbar'>
            <div className='nav-list'>
              <Link to='/' className='nav-link'>
                Home
              </Link>
              <Link to='/ideas/add/' className='nav-link'>
                Post Idea
              </Link>
              <Link to='/#about-project-section' className='nav-link'>
                Project
              </Link>
              <Link to='/#about-team-section' className='nav-link'>
                Team
              </Link>
            </div>
          </nav>
        </div>
        <div className='auth-buttons-area'>
          {isLogged ? (
            <>
              <div className='dropdown'>
                <ActionButton
                  tabIndex={0}
                  className='auth-button logged-in-button active'
                >
                  User: {userState.name}
                  <ChevronIcon />
                </ActionButton>
                <ul
                  tabIndex={0}
                  className='menu dropdown-content dropdown-main-brand-green'
                >
                  {links.map(({ to, text, ...otherProps }) => (
                    <li className='group' key={to}>
                      <Link
                        to={to}
                        className='block !text-base !px-5 !py-2 hover:bg-white hover:text-gray-800 hover:font-bold transition-colors duration-200'
                        {...otherProps}
                      >
                        {text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <Link
                className='auth-button login-button'
                to='/login'
                onClick={e => {
                  e.preventDefault();
                  dialogRef.current.showModal();
                }}
              >
                Login
              </Link>
              <dialog ref={dialogRef} className='modal'>
                <div className='modal-box'>
                  <LoginForm dialogRef={dialogRef} />
                  <form method='dialog'>
                    <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>
                      ✕
                    </button>
                  </form>
                </div>
                <form method='dialog' className='modal-backdrop'>
                  <button>close</button>
                </form>
              </dialog>
              <Link
                className='auth-button not-logged-in-button active'
                to='/register'
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
