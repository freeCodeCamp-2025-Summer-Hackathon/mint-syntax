import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useUser } from '../hooks/useUser';
import Spinny from '../components/Spinny';
import { ActionButton } from '../components/Buttons';

export default function LogoutPage() {
  const { state } = useLocation();
  const [loggingOut, setLoggingOut] = useState(state?.logOut);
  const { isLogged, logout } = useUser();

  useEffect(() => {
    if (loggingOut) {
      logout();
      setLoggingOut(false);
    }
  }, [loggingOut, logout, setLoggingOut]);

  if (loggingOut) {
    return <Spinny />;
  }

  return (
    <div className='max-w-md mx-auto mt-16 p-6 bg-[#f4fdf9] rounded-lg shadow-lg border border-[#cdeee3]'>
      {isLogged ? (
        <>
          <h1 className='section-heading'>Log out?</h1>
          <ActionButton onClick={() => setLoggingOut(true)}>
            Confirm
          </ActionButton>
        </>
      ) : (
        <>
          <h1 className='text-2xl font-bold mb-4 text-center text-[#317c67]'>
            👋 You&apos;re logged out
          </h1>
          <p className='mb-6 text-gray-600 text-center'>
            Thanks for using Idea Forge. You can log in again below.
          </p>
          <div className='flex justify-center'>
            <Link
              to='/login'
              className='animated-button !text-base !px-5 !py-2'
            >
              ⬅ Back to login
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
