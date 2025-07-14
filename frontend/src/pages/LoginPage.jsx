import { Link } from 'react-router';
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  return (
    <section>
      <LoginForm redirect_to='/' />
      Not registered? <Link to='/register'>Sign up</Link>
    </section>
  );
};

export default LoginPage;
