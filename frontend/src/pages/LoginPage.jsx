import { Link } from 'react-router';
import { LoginForm } from '../components/LoginForm';
import { useUser } from '../hooks/useUser';

export const LoginPage = () => {
  const { isLogged } = useUser();

  if (isLogged) {
    return <section>Already logged in</section>;
  }

  return (
    <section>
      <LoginForm />
      Not registered? <Link to='/register'>Sign up</Link>
    </section>
  );
};

export default LoginPage;
