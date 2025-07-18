import { useRef } from 'react';
import { useUser } from '../hooks/useUser';
import LoginForm from './LoginForm';
import IdeaForgeLogo from '../assets/Idea-Forge-logo.svg';

const Chevron = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='inline pl-1'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M6 9l6 6l6 -6' />
    </svg>
  );
};

const Header = () => {
  const dialogRef = useRef();
  const { isLogged, logout } = useUser();
  console.log('asdfg', dialogRef);

  return (
    <header className='header-style'>
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
              <a href='/' className='nav-link'>
                Home
              </a>
              <a href='/ideas/add/' className='nav-link'>
                Post Idea
              </a>
              <a href='/#about-project-section' className='nav-link'>
                Project
              </a>
              <a href='/#about-team-section' className='nav-link'>
                Team
              </a>
            </div>
          </nav>
        </div>
        <div className='auth-buttons-area'>
          {isLogged ? (
            <>
              <div className='dropdown'>
                <button
                  tabIndex={0}
                  className='auth-button logged-in-button active'
                >
                  User:
                  <Chevron />
                  User:
                  <Chevron />
                </button>
                <ul
                  tabIndex={0}
                  className='menu dropdown-content dropdown-main-brand-green'
                >
                  <li>
                    <a href='/me'>My profile</a>
                    <a href='/me'>My profile</a>
                  </li>
                  <li>
                    <a onClick={logout} href='/logout'>
                      Logout
                    </a>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <button
                className='auth-button login-button'
                onClick={() => {
                  dialogRef.current.showModal();
                }}
              >
                Login
              </button>
              <dialog ref={dialogRef} className='modal'>
                <div className='modal-box'>
                  <LoginForm />
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
              <a
                className='auth-button not-logged-in-button active'
                href='/register'
              >
                Register
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
