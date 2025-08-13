import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router';
import { useApi } from '../hooks/useApi';
import Spinny from '../components/Spinny';
import { Page, Pagination } from '../components/Pagination';
import { Link } from 'react-router';

const UsersPage = ({ count = 20 }) => {
  const { page = 1 } = useParams();
  const currentPage = Page.fromOneBased(parseInt(page));

  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  const { data, error, isLoading, fetchFromApi } = useApi({
    loadingInitially: true,
  });

  const getApiUrl = useCallback(
    (page = Page.fromZeroBased(0)) => {
      const skip = page.number > 0 ? `&skip=${page.number * count}` : '';
      return `/users/?limit=${count}${skip}`;
    },
    [count]
  );

  const getPageUrl = useCallback(
    page => `/users/page/${page.displayNumber}`,
    []
  );

  const fetchUrl = getApiUrl(currentPage);
  useEffect(() => {
    fetchFromApi(fetchUrl);
  }, [fetchFromApi, fetchUrl]);

  useEffect(() => {
    if (data && !error) {
      setUsers(data.users);
      const pages = Math.ceil(data.count / count);
      setTotalPages(pages);
    }
    if (error) {
      console.error('Error fetching users:', error);
    }
  }, [data, error, count]);

  return isLoading && users.length === 0 ? (
    <Spinny />
  ) : (
    <div className='section-card flex flex-col items-center min-h-[60vh]'>
      <h1 className='section-heading'>All Users</h1>
      {users.length > 0 ? (
        <>
          <ul className='w-full max-w-2xl'>
            {users.map(user => (
              <li
                key={user.id}
                className='idea-item mb-2 flex justify-between items-center'
              >
                <Link
                  to={`/users/${user.id}`}
                  className='idea-text flex-grow h-full flex items-center p-4 hover:bg-green-50 hover:font-bold rounded-lg transition-colors duration-200'
                >
                  {user.name} ({user.username})
                </Link>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className='flex justify-center mt-4'>
              <Pagination
                numberOfPages={totalPages}
                initialPage={currentPage}
                getPageUrl={getPageUrl}
                fetchPage={async page => {
                  await fetchFromApi(getApiUrl(page));
                }}
              />
            </div>
          )}
        </>
      ) : (
        <p className='text-lg text-gray-600'>No users found.</p>
      )}
    </div>
  );
};
export default UsersPage;
