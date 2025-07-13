import { useUser } from '../hooks/useUser';

const Header = () => {
  const { isLogged, login, logout } = useUser();

  return (
    <header className='header-style'>
      <div className='header-banner-content'>
        <div className='logo-area left-logo'>
          <img
            src='https://i.ibb.co/YBTqgZtd/Idea-Forge-logo-mirror-transparent-1.png'
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
                onClick={() => login({ name: 'placeholder' })}
              >
                Login
              </button>
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
