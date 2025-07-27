import { useRef } from 'react';
import { Link } from 'react-router';
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
  const { isLogged, logout, userState, isAdmin } = useUser();
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
              <Link to='/' className='nav-link'>
                Home
              </Link>
              <Link to='/ideas/add/' className='nav-link'>
                Post Idea
              </Link>
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
                  User: {userState.name}
                  <Chevron />
                </button>
                <ul
                  tabIndex={0}
                  className='menu dropdown-content dropdown-main-brand-green'
                >
                  {isAdmin && (
                    <>
                      <li className='group'>
                        <Link
                          to='/users'
                          className='block !text-base !px-6 !py-2 hover:bg-white hover:text-gray-800 hover:font-bold transition-colors duration-200'
                        >
                          Manage Users
                        </Link>
                      </li>
                      <li className='group'>
                        <Link
                          to='/users/add'
                          className='block !text-base !px-6 !py-2 hover:bg-white hover:text-gray-800 hover:font-bold transition-colors duration-200'
                        >
                          Add user
                        </Link>
                      </li>
                    </>
                  )}
                  <li className='group'>
                    <Link
                      to='/me'
                      className='block !text-base !px-5 !py-2 hover:bg-white hover:text-gray-800 hover:font-bold transition-colors duration-200'
                    >
                      My profile
                    </Link>
                  </li>
                  <li className='group'>
                    <Link
                      to='/me/ideas'
                      className='block !text-base !px-5 !py-2 hover:bg-white hover:text-gray-800 hover:font-bold transition-colors duration-200'
                    >
                      My Ideas
                    </Link>
                  </li>
                  <li className='group'>
                    <Link
                      to='/me/edit'
                      className='block !text-base !px-5 !py-2 hover:bg-white hover:text-gray-800 hover:font-bold transition-colors duration-200'
                    >
                      Edit profile
                    </Link>
                  </li>
                  <li className='group'>
                    <Link
                      onClick={logout}
                      to='/logout'
                      className='block !text-base !px-5 !py-2 hover:bg-white hover:text-gray-800 hover:font-bold transition-colors duration-200'
                    >
                      Logout
                    </Link>
                  </li>
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
