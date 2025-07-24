import { useUser } from '../hooks/useUser';
import { Link } from 'react-router';
import { useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import Spinny from '../components/Spinny';

const MePage = () => {
  const { isLoading, error, data, fetchFromApi } = useApi({
    loadingInitially: true,
  });
  const { isAdmin, isLogged } = useUser();

  useEffect(() => {
    fetchFromApi(`/me`);
  }, [fetchFromApi]);

  return (
    <div className='section-card min-h-[60vh] flex'>
      <div className='card bg-base-100 p-4 w-full text-gray-600 mb-8'>
        {!isLogged ? (
          <>
            <h1 className='section-heading'>No access</h1>
            <p className='text-lg text-gray-600 mb-8 self-center'>
              You have to be logged in to see this page!
            </p>
          </>
        ) : isLoading ? (
          <Spinny />
        ) : error ? (
          <>`${error}`</>
        ) : (
          <>
            <h1 className='section-heading'>{data.name}'s Profile</h1>
            <p>
              <span className='font-bold'>Account Name:</span>
              {isAdmin && <span> (Admin)</span>}
            </p>
            <p>
              <span className='font-bold'>Upvotes:</span> {data.upvotes.length}
            </p>
            <p>
              <span className='font-bold'>Downvotes:</span>{' '}
              {data.downvotes.length}
            </p>
            <Link className='underline' to='/me/ideas'>
              My ideas
            </Link>
            <Link className='underline' to='/me/edit'>
              Edit Profile
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default MePage;
