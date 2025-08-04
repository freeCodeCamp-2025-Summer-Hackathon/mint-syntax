import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
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
  const [originalFormData, setOriginalFormData] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [repeatNewPassword, setRepeatNewPassword] = useState('');
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
    sendAsJson: updateUser,
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
      const initialData = {
        username: fetchedUserData.username || '',
        name: fetchedUserData.name || '',
        is_admin: fetchedUserData.is_admin || false,
      };
      setFormData(initialData);
      setOriginalFormData(initialData);
    }
    if (fetchError) {
      console.error('Error fetching user data:', fetchError);
    }
  }, [fetchedUserData, fetchError]);

  useEffect(() => {
    if (updateResponse && !updateError) {
      console.log('User updated successfully:', updateResponse);
      setShowInlineConfirm(false);
      setNewPassword('');
      setRepeatNewPassword('');
      setOriginalFormData(formData);
      navigate(`/users/${id}`);
    }
    if (updateError) {
      console.error('Error updating user:', updateError);
    }
  }, [updateResponse, updateError, navigate, id, formData]);

  const handleChange = e => {
    const { name, value, type } = e.target;
    if (name === 'newPassword') {
      setNewPassword(value);
    } else if (name === 'repeatNewPassword') {
      setRepeatNewPassword(value);
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: type === 'radio' ? value === 'true' : value,
      }));
    }
    setFormErrors(prevErrors => ({
      ...prevErrors,
      [name]: undefined,
      newPassword: undefined,
      repeatNewPassword: undefined,
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

    if (newPassword.trim()) {
      if (newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters long.';
      }
      if (newPassword !== repeatNewPassword) {
        errors.repeatNewPassword = 'Passwords do not match.';
      }
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
      const dataToUpdate = { ...formData };
      if (newPassword.trim()) {
        dataToUpdate.new_password = newPassword.trim();
      }

      updateUser(`/users/${id}`, dataToUpdate);
    }
  };

  const cancelUpdate = () => {
    setShowInlineConfirm(false);
  };

  const hasChanges =
    originalFormData &&
    (formData.name !== originalFormData.name ||
      formData.is_admin !== originalFormData.is_admin ||
      newPassword.trim() !== '');

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
        <Link
          to={`/users/${id}`}
          className='animated-button !text-base !px-5 !py-2 !bg-gray-500 hover:!bg-gray-600'
        >
          Back to User Profile
        </Link>
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
        <Link to='/users' className='animated-button !text-base !px-5 !py-2'>
          Back to All Users
        </Link>
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
            className='input input-bordered w-full p-2 rounded-md focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300 hover:border-yellow-500'
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
            className='input input-bordered w-full p-2 rounded-md focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300 hover:border-yellow-500'
            disabled={isUpdating}
          />
          {formErrors.name && (
            <p className='text-error text-sm mt-1'>{formErrors.name}</p>
          )}
        </div>

        <div className='mb-4'>
          <label
            htmlFor='newPassword'
            className='block text-lg font-medium text-gray-700 mb-2'
          >
            New Password: (optional)
          </label>
          <input
            type='password'
            id='newPassword'
            name='newPassword'
            value={newPassword}
            onChange={handleChange}
            className='input input-bordered w-full p-2 rounded-md focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300 hover:border-yellow-500'
            disabled={isUpdating}
          />
          {formErrors.newPassword && (
            <p className='text-error text-sm mt-1'>{formErrors.newPassword}</p>
          )}
        </div>

        <div className='mb-4'>
          <label
            htmlFor='repeatNewPassword'
            className='block text-lg font-medium text-gray-700 mb-2'
          >
            Repeat New Password:
          </label>
          <input
            type='password'
            id='repeatNewPassword'
            name='repeatNewPassword'
            value={repeatNewPassword}
            onChange={handleChange}
            className='input input-bordered w-full p-2 rounded-md focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300 hover:border-yellow-500'
            disabled={isUpdating}
          />
          {formErrors.repeatNewPassword && (
            <p className='text-error text-sm mt-1'>
              {formErrors.repeatNewPassword}
            </p>
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
          <Link
            to={`/users/${id}`}
            className='animated-button !text-base !px-5 !py-2 !bg-gray-500 hover:!bg-gray-600'
          >
            Back to User Profile
          </Link>
          <button
            type='submit'
            className='animated-button !text-base !px-5 !py-2'
            disabled={isUpdating || showInlineConfirm || !hasChanges}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEditPage;
