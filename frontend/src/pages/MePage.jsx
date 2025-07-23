import { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { Link } from 'react-router';

const MePage = () => {
  const { isLogged, userState } = useUser();
  const [loggedUser] = useState(userState);
  return (
    <div className='section-card flex flex-col items-center justify-center min-h-[60vh]'>
      {isLogged ? (
        <>
          <h1 className='section-heading'>{loggedUser.name}'s Profile</h1>
          <div className='h-full w-full text-lg text-gray-600 mb-8 flex flex-col'>
            <p>
              <span className='font-bold'>Account Name:</span> {loggedUser.username}
              {loggedUser.is_admin && <span> (Admin)</span>}
            </p>
            <p>
              <span className='font-bold'>Upvotes:</span>{' '}
              {loggedUser.upvotes.size}
            </p>
            <p>
              <span className='font-bold'>Downvotes:</span>{' '}
              {loggedUser.downvotes.size}
            </p>
            <Link className='underline' to='/me/ideas'>
              My ideas
            </Link>
            <Link className='underline' to='/me/edit'>
              Edit Profile
            </Link>
          </div>
        </>
      ) : (
        <>
          <h1 className='section-heading'>No access</h1>
          <p className='text-lg text-gray-600 mb-8'>
            You have to be logged in to see this page!
          </p>
        </>
      )}
    </div>
  );
};

export default MePage;
