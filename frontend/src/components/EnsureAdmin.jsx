import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '../hooks/useUser';
import { EnsureLogin } from './EnsureLogin';

export const EnsureAdmin = ({ children }) => (
  <EnsureLogin>
    <RequireAdmin>{children}</RequireAdmin>
  </EnsureLogin>
);

const RequireAdmin = ({ children }) => {
  const { isAdmin } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  });

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default EnsureAdmin;
