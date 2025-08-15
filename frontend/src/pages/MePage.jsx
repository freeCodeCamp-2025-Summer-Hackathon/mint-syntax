import { useUser } from '../hooks/useUser';
import { Link } from 'react-router';
import { useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import Spinny from '../components/Spinny';

const MePage = () => {
  const { isLoading, error, data, fetchFromApi } = useApi({
    loadingInitially: true,
  });
  const { isAdmin } = useUser();

  useEffect(() => {
    fetchFromApi(`/me`);
  }, [fetchFromApi]);

  return (
    <div className='section-card min-h-[60vh] flex'>
      <div className='card bg-base-100 p-4 w-full text-gray-600 mb-8'>
        {isLoading ? (
          <Spinny />
        ) : error ? (
          <>`${error}`</>
        ) : (
          <>
            <h1 className='section-heading'>{data.name}&apos;s Profile</h1>
            <p>
              <span className='font-bold'>Account Name:</span> {data.username}
              {isAdmin && <span> (Admin)</span>}
            </p>
            <p>
              <span className='font-bold'>Upvotes:</span>{' '}
              <Link to='/me/upvotes'>{data.upvotes.length}</Link>
            </p>
            <p>
              <span className='font-bold'>Downvotes:</span>{' '}
              <Link to='/me/downvotes'>{data.downvotes.length}</Link>
            </p>
            <div className='flex flex-col sm:flex-row justify-center gap-4 mt-6'>
              <Link
                className='animated-button !text-base !px-5 !py-2'
                to='/me/ideas'
              >
                My ideas
              </Link>
              <Link
                className='animated-button !text-base !px-5 !py-2'
                to='/me/edit'
              >
                Edit Profile
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MePage;
