import { useUser } from '../hooks/useUser';
import { Link } from 'react-router';

const MePage = () => {
  const { isAdmin, isLogged, userState } = useUser();
  return (
    <div className='section-card min-h-[60vh] flex'>
      {isLogged ? (
        <div className='card bg-base-100 p-4 w-full text-gray-600 mb-8'>
          <h1 className='section-heading'>{userState.name}'s Profile</h1>
          <p>
            <span className='font-bold'>Account Name:</span>{' '}
            {userState.username}
            {isAdmin && <span> (Admin)</span>}
          </p>
          <p>
            <span className='font-bold'>Upvotes:</span> {userState.upvotes.size}
          </p>
          <p>
            <span className='font-bold'>Downvotes:</span>{' '}
            {userState.downvotes.size}
          </p>
          <Link className='underline' to='/me/ideas'>
            My ideas
          </Link>
          <Link className='underline' to='/me/edit'>
            Edit Profile
          </Link>
        </div>
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
