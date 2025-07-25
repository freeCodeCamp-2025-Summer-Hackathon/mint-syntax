import { Link } from 'react-router';
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  return (
    <div className='container-wrapper'>
      <section className='section-card flex flex-col justify-center items-center'>
        <h3 className='section-heading'>Login to your account:</h3>
        <div className='card bg-base-100 w-lg p-4 auto'>
          <LoginForm redirect_to='/' />

          {/* 🔐 Forgot password link */}
          <div className='text-center mt-4'>
            <Link to='/forgot-password' className='link link-hover'>
              Forgot your password?
            </Link>
          </div>
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
