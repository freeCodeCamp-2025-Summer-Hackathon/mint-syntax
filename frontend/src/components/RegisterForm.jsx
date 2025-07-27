import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';

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

export function RegisterForm({ redirect_to = '/' }) {
  const formRef = useRef();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    getValues,
  } = useForm({ mode: 'onTouched' });

  const { isLogged } = useUser();
  const navigate = useNavigate();

  const { error, response, data, fetchFromApi } = useApi({ method: 'POST' });

  useEffect(() => {
    if (data && !error) {
      navigate('/login');
    }
    if (error) {
      console.log('Error:', error);
    }
  }, [response, data, error, navigate]);

  useEffect(() => {
    if (isLogged && redirect_to) {
      navigate(redirect_to);
    }
  }, [isLogged, navigate, redirect_to]);

  const onSubmit = async () => {
    try {
      await fetchFromApi('/users', {
        method: 'POST',
        body: new FormData(formRef.current),
      });
    } catch (e) {
      console.log('error!', e);
    }
  };

  return (
    <form
      noValidate
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className='w-full max-w-md p-4 bg-white'
    >
      <div className='form-group'>
        <label htmlFor='username' className='form-label'>
          Username: <span className='text-red-500'>*</span>
        </label>
        <label className='input input-sm'>
          <UserIcon />
          <input
            id='username'
            {...register('username', { required: true })}
            type='text'
            placeholder='Username'
            className='input-validator'
            aria-invalid={!!errors.username}
          />
        </label>
      </div>
      {errors.username?.type === 'required' ? (
        <p role='alert' className='text-error text-xs mt-0.5'>
          The field "Username" is required.
        </p>
      ) : (
        error &&
        response.status === 409 && (
          <p role='alert' className='text-error text-xs mt-0.5'>
            This username is already in use.
          </p>
        )
      )}

      <div className='form-group'>
        <label htmlFor='name' className='form-label'>
          Name: <span className='text-red-500'>*</span>
        </label>
        <label className='input input-sm'>
          <UserIcon />
          <input
            id='name'
            {...register('name', { required: true })}
            type='text'
            placeholder='Name'
            className='input-validator'
            aria-invalid={!!errors.name}
          />
        </label>
      </div>
      {errors.name?.type === 'required' && (
        <p role='alert' className='text-error text-xs mt-0.5'>
          The field "Name" is required.
        </p>
      )}

      <div className='form-group'>
        <label htmlFor='password' className='form-label'>
          Password: <span className='text-red-500'>*</span>
        </label>
        <label className='input input-sm'>
          <PasswordIcon />
          <input
            id='password'
            {...register('password', { required: true, minLength: 8 })}
            type='password'
            placeholder='Password'
            className='input-validator'
            aria-invalid={!!errors.password}
          />
        </label>
      </div>
      {errors.password?.type === 'required' ? (
        <p role='alert' className='text-error text-xs mt-0.5'>
          The field "Password" is required.
        </p>
      ) : (
        errors.password?.type === 'minLength' && (
          <p role='alert' className='text-error text-xs mt-0.5'>
            Password needs to be at least 8 characters long.
          </p>
        )
      )}

      <div className='form-group'>
        <label htmlFor='repeatPassword' className='form-label'>
          Repeat Password: <span className='text-red-500'>*</span>
        </label>
        <label className='input input-sm'>
          <PasswordIcon />
          <input
            id='repeatPassword'
            {...register('repeatPassword', {
              required: true,
              validate: value => getValues('password') === value,
            })}
            type='password'
            placeholder='Password'
            title='Must match the password entered in the previous input field'
            className='input-validator'
            aria-invalid={!!errors.repeatPassword}
          />
        </label>
      </div>
      {errors.repeatPassword?.type === 'required' ? (
        <p role='alert' className='text-error text-xs mt-0.5'>
          The field "Repeat Password" is required.
        </p>
      ) : (
        errors.repeatPassword?.type === 'validate' && (
          <p role='alert' className='text-error text-xs mt-0.5'>
            Both passwords need to match.
          </p>
        )
      )}

      {error && response.status !== 409 && (
        <div role='alert' className='text-error text-center text-xs mt-0.5'>
          Something went wrong, please try again later.
        </div>
      )}

      <div className='flex justify-center'>
        <button
          className='my-1 animated-button'
          {...(isSubmitting && { disabled: 'disabled' })}
        >
          Register
        </button>
      </div>
    </form>
  );
}

export default RegisterForm;
