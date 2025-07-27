import { useUser } from '../hooks/useUser';
/*import { Link } from 'react-router';*/
import { useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useForm } from 'react-hook-form';
import { useRef } from 'react';
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

const MeEditPage = () => {
  const formRef = useRef();
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
  } = useForm();

  useEffect(() => {
    if (data && !error) {
      console.log('Changes applied!');
    }
    if (error) {
      console.log('Error:', error);
    }
  }, [response, data, error]);

  const onSubmit = async () => {
    try {
      await fetchFromApi(`/users/${data.id}`, {
        method: 'PATCH',
        body: new FormData(formRef.current),
      });
    } catch (e) {
      console.log('error!', e);
    }
  };
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
            <h1 className='section-heading'>Edit {data.name}'s Profile</h1>

            <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
              <div className='form-group'>
                <label htmlFor='name' className='form-label'>
                  Name: <span className='text-red-500'>*</span>
                </label>

                <label className='input input-sm'>
                  <UserIcon />
                  <input
                    id='name'
                    {...register('name', { required: true })}
                    type='Text'
                    placeholder='Name'
                    className='input-validator'
                    aria-invalid={!!errors.name}
                  />
                </label>
              </div>
              {errors.name?.type === 'required' && (
                <p role='alert' className='text-error'>
                  The field "Name" is required.
                </p>
              )}

              {error && response.status !== 409 && (
                <div className='text-error text-center'>
                  Something went wrong, please try again later.
                </div>
              )}

              <div className='flex justify-center'>
                <button
                  className='my-1 animated-button'
                  type='submit'
                  {...(isSubmitting && { disabled: 'disabled' })}
                >
                  Update Name
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default MeEditPage;
