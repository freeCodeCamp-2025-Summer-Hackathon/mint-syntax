import { useUser } from '../hooks/useUser';
import { Link } from 'react-router';
import { useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useForm } from 'react-hook-form';
import Spinny from '../components/Spinny';

const UserIcon = () => {
  return (
    <svg
      className='h-[1em] opacity-50'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
    >
      <g
        strokeLinejoin='round'
        strokeLinecap='round'
        strokeWidth='2.5'
        fill='none'
        stroke='currentColor'
      >
        <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'></path>
        <circle cx='12' cy='7' r='4'></circle>
      </g>
    </svg>
  );
};

const PasswordIcon = () => {
  return (
    <svg
      className='h-[1em] opacity-50'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
    >
      <g
        strokeLinejoin='round'
        strokeLinecap='round'
        strokeWidth='2.5'
        fill='none'
        stroke='currentColor'
      >
        <path d='M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z'></path>
        <circle cx='16.5' cy='7.5' r='.5' fill='currentColor'></circle>
      </g>
    </svg>
  );
};

const MeEditPage = () => {
  const { isLoading, error, data, response, fetchFromApi } = useApi({
    loadingInitially: true,
  });
  const { isLogged } = useUser();

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
    if (data && !error) {
      console.log('Changes applied!');
    }
    if (error) {
      console.log('Error:', error);
    }
  }, [response, data, error]);

  const onSubmit = async formData => {
    try {
      await fetchFromApi(`/users/${data.id}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
    } catch (e) {
      console.log('error!', e);
    }
    console.log(formData);
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
      ) : error ? (
        <>`${error}`</>
      ) : (
        <>
          <h1 className='section-heading'>Edit {data.name}'s Profile</h1>

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
                htmlFor='password'
                className='block text-lg font-medium text-gray-700 mb-2'
              >
                New Password:
              </label>
              <label className='input input-sm'>
                <PasswordIcon />
                <input
                  id='password'
                  {...register('password', { minLength: 8 })}
                  type='Password'
                  placeholder='Password'
                  className='input-validator'
                  aria-invalid={!!errors.password}
                />
              </label>
            </div>
            {errors.password?.type === 'required' ? (
              <p role='alert' className='text-error'>
                The field "Password" is required.
              </p>
            ) : (
              errors.password?.type === 'minLength' && (
                <p role='alert' className='text-error'>
                  Password needs to be at least 8 characters long.
                </p>
              )
            )}

            <div className='form-group'>
              <label
                htmlFor='repeatPassword'
                className='block text-lg font-medium text-gray-700 mb-2'
              >
                Repeat New Password:
              </label>
              <label className='input input-sm'>
                <PasswordIcon />
                <input
                  id='repeatPassword'
                  {...register('repeatPassword', {
                    validate: value => getValues('password') === value,
                  })}
                  type='password'
                  placeholder='Password'
                  title='Must match the password entered in the previous input field'
                  aria-invalid={!!errors.repeatPassword}
                />
              </label>
            </div>
            {errors.repeatPassword?.type === 'required' ? (
              <p role='alert' className='text-error'>
                The field "Repeat Password" is required.
              </p>
            ) : (
              errors.repeatPassword?.type === 'validate' && (
                <p role='alert' className='text-error'>
                  Both passwords need to match.
                </p>
              )
            )}

            {error && response.status !== 409 && (
              <div className='text-error text-center'>
                Something went wrong, please try again later.
              </div>
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
