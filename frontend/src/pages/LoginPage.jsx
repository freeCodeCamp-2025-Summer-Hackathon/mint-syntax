import { Link, useLocation } from 'react-router';
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  const { search } = useLocation();
  const redirect_to = new URLSearchParams(search).get('redirect') ?? '/';

  return (
    <div className='container-wrapper'>
      <section className='section-card flex flex-col justify-center items-center'>
        <h3 className='section-heading'>Login to your account:</h3>
        <div className='card bg-base-100 w-lg p-4 auto'>
          <LoginForm redirect_to={redirect_to} />
        </div>

        {/* ✍️ Register link */}
        <p className='mt-4'>
          Not registered?{' '}
          <Link to='/register' className='link'>
            Sign up
          </Link>
        </p>
      </section>
    </div>
  );
};

export default LoginPage;
