import { useEffect, useState, useRef } from 'react';
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
  } = useApi();

  const {
    data: updateUserData,
    error: updateError,
    isLoading: isUpdating,
    sendAsJson: updateUserStatus,
  } = useApi({ method: 'PATCH' });

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
      setUserData(fetchUserData);
    }
    if (fetchUserError) {
      console.error('Error fetching user data:', fetchUserError);
    }
  }, [fetchUserData, fetchUserError]);

  useEffect(() => {
    if (updateUserData && !updateError) {
      console.log('User status updated:', updateUserData);
      closeDeactivateModal();
      setUserData(prevData => ({
        ...prevData,
        is_active: updateUserData.is_active,
      }));
    }
    if (updateError) {
      console.error('Error updating user status:', updateError);
    }
  }, [updateUserData, updateError, navigate]);

  const handleToggleStatusClick = () => {
    setShowDeactivateModal(true);
    if (deactivateModalRef.current) {
      deactivateModalRef.current.showModal();
    }
  };

  const confirmToggleStatus = () => {
    if (id && !isUpdating && userData) {
      const newStatus = !userData.is_active;
      updateUserStatus(`/users/${id}`, { is_active: newStatus });
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
        <Link to='/users' className='animated-button !text-base !px-5 !py-2'>
          Back to All Users
        </Link>
      </div>
    );
  }

  const isUserActive = userData.is_active;
  const modalAction = isUserActive ? 'Deactivate' : 'Activate';
  const modalTitle = `Confirm ${isUserActive ? 'Deactivation' : 'Activation'}`;
  const confirmButtonClass = isUserActive
    ? 'animated-button !text-base !px-5 !py-2 !bg-gradient-to-r from-red-500 to-red-700 hover:!from-red-600 hover:!to-red-800'
    : 'animated-button !text-base !px-5 !py-2 !bg-gradient-to-r from-green-500 to-green-700 hover:!from-green-600 hover:!to-green-800';

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
        <p className='text-lg mb-4'>
          <strong>Admin:</strong> {userData.is_admin ? 'Yes' : 'No'}
        </p>
        <p className='text-lg mb-4'>
          <strong>Status:</strong> {isUserActive ? 'Active' : 'Inactive'}
        </p>

        <div className='flex flex-col sm:flex-row justify-center gap-4 mt-6'>
          <Link
            to={`/users/${id}/edit`}
            className='animated-button !text-base !px-5 !py-2'
          >
            Edit User
          </Link>
          <Link
            to={`/users/${id}/ideas`}
            className='animated-button !text-base !px-5 !py-2'
          >
            View All Ideas
          </Link>
          <button
            onClick={handleToggleStatusClick}
            disabled={isUpdating}
            className={confirmButtonClass}
          >
            {isUpdating ? 'Updating Status...' : `${modalAction} Account`}
          </button>
        </div>
      </div>

      <dialog
        ref={deactivateModalRef}
        className='modal'
        open={showDeactivateModal}
      >
        <div className='modal-box'>
          <h3 className='font-bold text-lg'>{modalTitle}</h3>
          <p className='py-4'>{`${modalAction} ${userData.name}'s account?`}</p>
          {updateError && (
            <p className='text-error mb-4'>Error: {updateError.message}</p>
          )}
          <div className='modal-action'>
            <button
              className='animated-button !text-base !px-5 !py-2 mr-2'
              onClick={closeDeactivateModal}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              className={confirmButtonClass}
              onClick={confirmToggleStatus}
              disabled={isUpdating}
            >
              {isUpdating ? 'Confirming...' : `Confirm ${modalAction}`}
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
