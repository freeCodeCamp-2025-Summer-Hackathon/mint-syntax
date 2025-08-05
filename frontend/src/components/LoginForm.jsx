import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';

const UserIcon = () => (
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

const PasswordIcon = () => (
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

export function LoginForm({ redirect_to = '/', dialogRef }) {
  const formRef = useRef();
  const {
    formState: { errors, isSubmitting, isValid },
    handleSubmit,
    register,
    setError,
  } = useForm();
  const { isLogged, login } = useUser();
  const navigate = useNavigate();
  const { error, response, data, sendFormData } = useApi({ method: 'POST' });

  useEffect(() => {
    if (isLogged && redirect_to) {
      navigate(redirect_to);
    }
  }, [isLogged, navigate, redirect_to]);

  useEffect(() => {
    if (data && !error) {
      login(data);
    }
    if (error && response && data) {
      if (response?.status === 401) {
        setError('root.responseError', { type: 401, message: data?.detail });
      }
    }
  }, [data, error, login, response, setError]);

  const onSubmit = async () => {
    try {
      await sendFormData('/auth', { formRef });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
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
        {errors.username?.type === 'required' && (
          <p role='alert' className='text-error'>
            The field &quot;Username&quot; is required.
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
              {...register('password', { required: true })}
              type='password'
              placeholder='Password'
              className='input-validator'
              aria-invalid={!!errors.password}
            />
          </label>
        </div>
        {errors.password?.type === 'required' && (
          <p role='alert' className='text-error'>
            The field &quot;Password&quot; is required.
          </p>
        )}

        {errors?.root?.responseError && (
          <p role='alert' className='text-error text-center'>
            {errors.root.responseError.message}
          </p>
        )}
        {error && !errors.root?.responseError && (
          <p role='alert' className='text-error text-center'>
            Error, try again later.
          </p>
        )}

        <div className='flex justify-center'>
          <button
            className='my-1 animated-button'
            {...((isSubmitting || !isValid) && { disabled: 'disabled' })}
          >
            {isSubmitting && <span className='loading loading-spinner'></span>}
            Login
          </button>
        </div>
      </form>

      {/* 🔐 Forgot password link */}
      <div className='text-center mt-4'>
        <Link
          to='/forgot-password'
          className='link link-hover'
          {...(dialogRef && {
            onClick: () => {
              dialogRef.current.close();
            },
          })}
        >
          Forgot your password?
        </Link>
      </div>
    </>
  );
}

export default LoginForm;
