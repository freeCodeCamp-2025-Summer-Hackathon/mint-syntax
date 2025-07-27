import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useUser } from '../hooks/useUser';
import { useApi } from '../hooks/useApi';
import Spinny from '../components/Spinny';

const UserEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLogged, isAdmin } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    is_admin: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [showInlineConfirm, setShowInlineConfirm] = useState(false);

  const {
    data: fetchedUserData,
    error: fetchError,
    isLoading: isFetching,
    fetchFromApi: fetchUser,
  } = useApi({ loadingInitially: true });

  const {
    data: updateResponse,
    error: updateError,
    isLoading: isUpdating,
    fetchFromApi: updateUser,
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
    if (fetchedUserData && !fetchError) {
      setFormData({
        username: fetchedUserData.username || '',
        name: fetchedUserData.name || '',
        is_admin: fetchedUserData.is_admin || false,
      });
    }
    if (fetchError) {
      console.error('Error fetching user data:', fetchError);
    }
  }, [fetchedUserData, fetchError]);

  useEffect(() => {
    if (updateResponse && !updateError) {
      console.log('User updated successfully:', updateResponse);
      setShowInlineConfirm(false);
      navigate(`/users/${id}`);
    }
    if (updateError) {
      console.error('Error updating user:', updateError);
    }
  }, [updateResponse, updateError, navigate, id]);

  const handleChange = e => {
    const { name, value, type } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'radio' ? value === 'true' : value,
    }));
    setFormErrors(prevErrors => ({
      ...prevErrors,
      [name]: undefined,
    }));
    setShowInlineConfirm(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = 'Username is required.';
    }
    if (!formData.name.trim()) {
      errors.name = 'Name is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) {
      setShowInlineConfirm(true);
    }
  };

  const confirmUpdate = () => {
    if (id && !isUpdating) {
      updateUser(`/users/${id}`, {
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(formData),
      });
    }
  };

  const cancelUpdate = () => {
    setShowInlineConfirm(false);
  };

  if (isFetching) {
    return <Spinny />;
  }

  if (fetchError && !fetchedUserData) {
    return (
      <div className='section-card flex flex-col items-center justify-center min-h-[60vh]'>
        <h1 className='section-heading text-error'>Error</h1>
        <p className='text-lg text-gray-600 mb-8'>
          {fetchError?.message || 'Could not load user data for editing.'}
        </p>
        <button
          onClick={() => navigate(`/users/${id}`)}
          className='animated-button !text-base !px-5 !py-2'
        >
          Back to User Profile
        </button>
      </div>
    );
  }

  if (!fetchedUserData) {
    return (
      <div className='section-card flex flex-col items-center justify-center min-h-[60vh]'>
        <h1 className='section-heading'>User Not Found</h1>
        <p className='text-lg text-gray-600 mb-8'>
          The user you are trying to edit does not exist.
        </p>
        <button
          onClick={() => navigate('/users')}
          className='animated-button !text-base !px-5 !py-2'
        >
          Back to All Users
        </button>
      </div>
    );
  }

  return (
    <div className='section-card flex flex-col items-center min-h-[60vh]'>
      <h1 className='section-heading'>
        Edit User: {formData.name || formData.username}
      </h1>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-xl p-4 bg-base-200 rounded-lg shadow-md'
      >
        <div className='mb-4'>
          <label
            htmlFor='username'
            className='block text-lg font-medium text-gray-700 mb-2'
          >
            Username:
          </label>
          <input
            type='text'
            id='username'
            name='username'
            value={formData.username}
            onChange={handleChange}
            className='input input-bordered w-full p-2 rounded-md'
            disabled={isUpdating}
            readOnly
          />
          {formErrors.username && (
            <p className='text-error text-sm mt-1'>{formErrors.username}</p>
          )}
        </div>

        <div className='mb-4'>
          <label
            htmlFor='name'
            className='block text-lg font-medium text-gray-700 mb-2'
          >
            Name:
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={handleChange}
            className='input input-bordered w-full p-2 rounded-md'
            disabled={isUpdating}
          />
          {formErrors.name && (
            <p className='text-error text-sm mt-1'>{formErrors.name}</p>
          )}
        </div>

        <div className='mb-4'>
          <label className='block text-lg font-medium text-gray-700 mb-2'>
            Admin Status:
          </label>
          <div className='flex items-center space-x-4'>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='is_admin'
                value='true'
                checked={formData.is_admin === true}
                onChange={handleChange}
                className='radio radio-primary'
                disabled={isUpdating}
              />
              <span className='ml-2 text-gray-700'>Yes</span>
            </label>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='is_admin'
                value='false'
                checked={formData.is_admin === false}
                onChange={handleChange}
                className='radio radio-primary'
                disabled={isUpdating}
              />
              <span className='ml-2 text-gray-700'>No</span>
            </label>
          </div>
        </div>

        {showInlineConfirm && (
          <div
            className='bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4'
            role='alert'
          >
            <p className='font-bold'>Confirm Update</p>
            <p>Are you sure you want to save these changes?</p>
            {updateError && (
              <p className='text-error mt-2'>Error: {updateError.message}</p>
            )}
            <div className='flex justify-end gap-4 mt-4'>
              <button
                type='button'
                onClick={cancelUpdate}
                className='animated-button !text-base !px-5 !py-2 !bg-gray-500 hover:!bg-gray-600'
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={confirmUpdate}
                className='animated-button !text-base !px-5 !py-2'
                disabled={isUpdating}
              >
                {isUpdating ? 'Confirming...' : 'Confirm Save'}
              </button>
            </div>
          </div>
        )}

        <div className='flex justify-center gap-4 mt-6'>
          <button
            type='button'
            onClick={() => navigate(`/users/${id}`)}
            className='animated-button !text-base !px-5 !py-2 !bg-gray-500 hover:!bg-gray-600'
            disabled={isUpdating}
          >
            Back to User Profile
          </button>
          <button
            type='submit'
            className='animated-button !text-base !px-5 !py-2'
            disabled={isUpdating || showInlineConfirm}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEditPage;
