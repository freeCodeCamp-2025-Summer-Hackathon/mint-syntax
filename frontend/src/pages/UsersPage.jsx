import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useUser } from '../hooks/useUser';
import { useApi } from '../hooks/useApi';
import Spinny from '../components/Spinny';
import { Pagination } from '../components/Pagination';
import { Link } from 'react-router';

const UsersPage = () => {
  const { userState, isLogged } = useUser();
  const navigate = useNavigate();
  const { page = 1 } = useParams();
  const currentPage = parseInt(page, 10) - 1;

  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  const { data, error, isLoading, fetchFromApi } = useApi({ method: 'GET' });

  const count = 20;

  const getApiUrl = useCallback(
    (pageNo = 0) => {
      const skip = pageNo > 0 ? `&skip=${pageNo * count}` : '';
      return `/users?limit=${count}${skip}`;
    },
    [count]
  );

  const getPageUrl = useCallback(pageNo => `/users/page/${pageNo + 1}`, []);

  useEffect(() => {
    if (!isLogged) {
      navigate('/login');
      return;
    }
    if (!userState.is_admin) {
      navigate('/');
      return;
    }

    fetchFromApi(getApiUrl(currentPage));
  }, [
    isLogged,
    userState.is_admin,
    navigate,
    currentPage,
    fetchFromApi,
    getApiUrl,
  ]);

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

  if (isLoading) {
    return <Spinny />;
  }

  return (
    <div className='section-card flex flex-col items-center min-h-[60vh]'>
      <h1 className='section-heading'>All Users</h1>
      {users.length > 0 ? (
        <>
          <ul className='w-full max-w-2xl'>
            {users.map(user => (
              <li key={user.id} className='idea-item mb-2'>
                <Link to={`/users/${user.id}`} className='idea-text'>
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
                fetchFromApi={url => fetchFromApi(url)}
                getApiUrl={getApiUrl}
                getPageUrl={getPageUrl}
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
