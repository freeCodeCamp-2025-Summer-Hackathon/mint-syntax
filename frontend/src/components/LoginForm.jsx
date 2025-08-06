import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router';
import { UserIcon } from './Icons/UserIcon';
import { PasswordIcon } from './Icons/PasswordIcon';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import { SubmitButton } from './Buttons';

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
          <SubmitButton disabled={isSubmitting || !isValid}>
            {isSubmitting && <span className='loading loading-spinner'></span>}
            Login
          </SubmitButton>
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
