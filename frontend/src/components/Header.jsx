import { useRef } from 'react';
import { useUser } from '../hooks/useUser';
import LoginForm from './LoginForm';
import IdeaForgeLogo from "../assets/Idea-Forge-logo.svg"

const Header = () => {
  const dialogRef = useRef();
  const { isLogged, logout } = useUser();

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
              <a href='#' className='nav-link'>
                Post Idea
              </a>
              <a href='#about-project-section' className='nav-link'>
                Project
              </a>
              <a href='#about-team-section' className='nav-link'>
                Team
              </a>
            </div>
          </nav>
        </div>
        <div className='auth-buttons-area'>
          {isLogged ? (
            <>
              <button className='auth-button logout-button' onClick={logout}>
                Logout
              </button>
              <button className='auth-button logged-in-button active'>
                Logged In
              </button>
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
              <button className='auth-button not-logged-in-button active'>
                Not Logged In
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
