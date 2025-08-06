import { useUser } from '../hooks/useUser';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useForm } from 'react-hook-form';
import { PasswordIcon } from '../components/Icons/PasswordIcon';
import { UserIcon } from '../components/Icons/UserIcon';
import Spinny from '../components/Spinny';

const MeEditPage = () => {
  const { isLoading, error, data, response, fetchFromApi, sendAsJson } = useApi(
    {
      loadingInitially: true,
    }
  );
  const { isLogged } = useUser();
  const [formSent, setFormSent] = useState(false);
  const [headerUserName, setHeaderUserName] = useState('');

  useEffect(() => {
    fetchFromApi(`/me`);
  }, [fetchFromApi]);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    getValues,
  } = useForm();

  useEffect(() => {
    if (data?.name) {
      setHeaderUserName(data.name);
    }
    if (error) {
      console.log('Error:', error);
    }
  }, [response, data, error]);

  const onSubmit = async formData => {
    setFormSent(true);
    try {
      await sendAsJson(
        `/me`,
        { formData },
        {
          method: 'PATCH',
        }
      );
    } catch (e) {
      console.log('error!', e);
    }
  };

  return (
    <div className='section-card min-h-[60vh] flex flex-col items-center'>
      {!isLogged ? (
        <>
          <h1 className='section-heading'>No access</h1>
          <p className='text-lg text-gray-600 mb-8 self-center'>
            You have to be logged in to see this page!
          </p>
        </>
      ) : isLoading ? (
        <Spinny />
      ) : (
        <>
          <h1 className='section-heading'>Edit {headerUserName}'s Profile</h1>

          <form
            className='w-full max-w-xl p-4 bg-base-200 rounded-lg shadow-md'
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className='form-group'>
              <label
                htmlFor='name'
                className='block text-lg font-medium text-gray-700 mb-2'
              >
                Name:
              </label>

              <label className='input input-sm'>
                <UserIcon />
                <input
                  id='name'
                  {...register('name', { required: true })}
                  type='Text'
                  defaultValue={data.name}
                  className='input-validator'
                />
              </label>
            </div>

            {errors.username?.type === 'required' ? (
              <p role='alert' className='text-error'>
                The field "Username" is required.
              </p>
            ) : (
              error &&
              response.status === 409 && (
                <p role='alert' className='text-error'>
                  This username is already in use.
                </p>
              )
            )}

            <div className='form-group'>
              <label
                htmlFor='new-password'
                className='block text-lg font-medium text-gray-700 mb-2'
              >
                New Password:
              </label>
              <label className='input input-sm'>
                <PasswordIcon />
                <input
                  id='new-password'
                  {...register('new_password', {
                    minLength: 8,
                  })}
                  type='Password'
                  placeholder='New Password'
                  className='input-validator'
                  aria-invalid={!!errors.new_password}
                />
              </label>
            </div>
            {errors.new_password?.type === 'validate' &&
              errors.new_password?.type === 'minLength' && (
                <p role='alert' className='text-error'>
                  Passwords needs to be at least 8 characters long.
                </p>
              )}

            <div className='form-group'>
              <label
                htmlFor='repeat-password'
                className='block text-lg font-medium text-gray-700 mb-2'
              >
                Repeat New Password:
              </label>
              <label className='input input-sm'>
                <PasswordIcon />
                <input
                  id='repeat-password'
                  {...register('repeat_password', {
                    validate: value => getValues('new_password') === value,
                  })}
                  type='password'
                  placeholder='Repeat Password'
                  title='Must match the password entered in the previous input field'
                  aria-invalid={!!errors.repeat_password}
                />
              </label>
            </div>
            {errors.repeat_password?.type === 'validate' && (
              <p role='alert' className='text-error'>
                Both passwords need to match.
              </p>
            )}

            <div className='form-group'>
              <label
                htmlFor='old-password'
                className='block text-lg font-medium text-gray-700 mb-2'
              >
                Old Password (confirm password change):
              </label>
              <label className='input input-sm'>
                <PasswordIcon />
                <input
                  id='old-password'
                  {...register('old_password', {
                    minLength: 8,
                  })}
                  type='Password'
                  placeholder='Old Password'
                  className='input-validator'
                  aria-invalid={!!errors.old_password}
                />
              </label>
            </div>
            {errors.old_password?.type === 'minLength' ? (
              <p role='alert' className='text-error'>
                Passwords needs to be at least 8 characters long.
              </p>
            ) : errors.new_password?.type === 'validate' ? (
              <p role='alert' className='text-error'>
                Old password needs to pe provided when changing passwords.
              </p>
            ) : (
              error &&
              response.status === 403 && (
                <p role='alert' className='text-error'>
                  Old password is invalid.
                </p>
              )
            )}

            {error && response.status !== 403 && (
              <div className='text-error text-center'>
                Something went wrong, please try again later.
              </div>
            )}

            {response.status === 200 && formSent && (
              <div className='text-info text-center'>Changes applied!</div>
            )}

            <div className='flex justify-center gap-4 mt-6'>
              <Link
                to={`/me`}
                className='animated-button !text-base !px-5 !py-2 !bg-gray-500 hover:!bg-gray-600'
              >
                Back to Profile
              </Link>
              <button
                className='my-1 animated-button !text-base !px-5 !py-2 !bg-gray-500 hover:!bg-gray-600'
                type='submit'
                {...(isSubmitting && { disabled: 'disabled' })}
              >
                Save Changes
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default MeEditPage;
