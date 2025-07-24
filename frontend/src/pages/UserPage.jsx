import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useUser } from '../hooks/useUser';
import { useApi } from '../hooks/useApi';
import Spinny from '../components/Spinny';

const UserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLogged, isAdmin } = useUser();
  const [userData, setUserData] = useState(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const deactivateModalRef = useRef(null);

  const {
    data: fetchUserData,
    error: fetchUserError,
    isLoading: isUserLoading,
    fetchFromApi: fetchUser,
  } = useApi({ method: 'GET' });

  const {
    data: deactivateData,
    error: deactivateError,
    isLoading: isDeactivating,
    fetchFromApi: deactivateUser,
  } = useApi({ method: 'DELETE' });

  useEffect(() => {
    if (!isLogged) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }

    if (id) {
      fetchUser(`/users/${id}`);
    }
  }, [id, isLogged, isAdmin, navigate, fetchUser]);

  useEffect(() => {
    if (fetchUserData && !fetchUserError) {
      setUserData(fetchUserData.user);
    }
    if (fetchUserError) {
      console.error('Error fetching user data:', fetchUserError);
    }
  }, [fetchUserData, fetchUserError]);

  useEffect(() => {
    if (deactivateData && !deactivateError) {
      console.log('User deactivated:', deactivateData);
      setShowDeactivateModal(false);
      navigate('/users');
    }
    if (deactivateError) {
      console.error('Error deactivating user:', deactivateError);
    }
  }, [deactivateData, deactivateError, navigate]);

  const handleDeactivateClick = () => {
    setShowDeactivateModal(true);
    if (deactivateModalRef.current) {
      deactivateModalRef.current.showModal();
    }
  };

  const confirmDeactivate = () => {
    if (id && !isDeactivating) {
      deactivateUser(`/users/${id}/deactivate`);
    }
  };

  const closeDeactivateModal = () => {
    setShowDeactivateModal(false);
    if (deactivateModalRef.current) {
      deactivateModalRef.current.close();
    }
  };

  if (isUserLoading) {
    return <Spinny />;
  }

  if (fetchUserError || !userData) {
    return (
      <div className='section-card flex flex-col items-center justify-center min-h-[60vh]'>
        <h1 className='section-heading text-error'>Error</h1>
        <p className='text-lg text-gray-600 mb-8'>
          {fetchUserError?.message ||
            'Could not load user data or user not found.'}
        </p>
        <Link to='/users' className='animated-button'>
          Back to All Users
        </Link>
      </div>
    );
  }

  return (
    <div className='section-card flex flex-col items-center min-h-[60vh]'>
      <h1 className='section-heading'>User Profile: {userData.name}</h1>
      <div className='w-full max-w-xl p-4 bg-base-200 rounded-lg shadow-md'>
        <p className='text-lg mb-2'>
          <strong>Username:</strong> {userData.username}
        </p>
        <p className='text-lg mb-2'>
          <strong>Name:</strong> {userData.name}
        </p>
        <p className='text-lg mb-2'>
          <strong>Email:</strong> {userData.email}
        </p>
        <p className='text-lg mb-4'>
          <strong>Admin:</strong> {userData.is_admin ? 'Yes' : 'No'}
        </p>

        <div className='flex flex-col sm:flex-row justify-center gap-4 mt-6'>
          <Link to={`/users/${id}/edit`} className='animated-button'>
            Edit User
          </Link>
          <Link to={`/users/${id}/ideas`} className='animated-button'>
            View All Ideas
          </Link>
          <button
            onClick={handleDeactivateClick}
            disabled={isDeactivating}
            className='animated-button bg-red-500 hover:bg-red-600'
          >
            {isDeactivating ? 'Deactivating...' : 'Deactivate Account'}
          </button>
        </div>
      </div>

      <dialog
        ref={deactivateModalRef}
        className='modal'
        open={showDeactivateModal}
      >
        <div className='modal-box'>
          <h3 className='font-bold text-lg'>Confirm Deactivation</h3>
          <p className='py-4'>
            Are you sure you want to deactivate {userData.name}'s account? This
            action cannot be undone.
          </p>
          {deactivateError && (
            <p className='text-error mb-4'>Error: {deactivateError.message}</p>
          )}
          <div className='modal-action'>
            <button
              className='animated-button mr-2'
              onClick={closeDeactivateModal}
              disabled={isDeactivating}
            >
              Cancel
            </button>
            <button
              className='animated-button bg-red-500 hover:bg-red-600'
              onClick={confirmDeactivate}
              disabled={isDeactivating}
            >
              {isDeactivating ? 'Confirming...' : 'Confirm Deactivate'}
            </button>
          </div>
        </div>
        <form
          method='dialog'
          className='modal-backdrop'
          onClick={closeDeactivateModal}
        >
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default UserPage;
