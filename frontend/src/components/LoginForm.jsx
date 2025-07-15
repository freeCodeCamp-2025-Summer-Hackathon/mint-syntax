import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';

export const LoginForm = ({ redirect_to = null }) => {
  const formRef = useRef();
  const {
    formState: { errors, isSubmitting, isValid },
    handleSubmit,
    register,
    setError,
  } = useForm();
  const { isLogged, login } = useUser();
  const navigate = useNavigate();

  const { error, response, data, fetchFromApi } = useApi({ method: 'POST' });

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
      await fetchFromApi('/auth', {
        method: 'POST',
        body: new FormData(formRef.current),
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      <label className='floating-label'>
        <span>Username</span>
        <input
          {...register('username')}
          placeholder='Username'
          className='input validator'
          required
        />
      </label>

      <label className='floating-label'>
        <span>Password</span>
        <input
          {...register('password')}
          type='Password'
          placeholder='Password'
          className='input validator'
          minLength='8'
          required
        />
      </label>
      <button
        className='btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl'
        {...((isSubmitting || !isValid) && { disabled: 'disabled' })}
      >
        {isSubmitting && <span className='loading loading-spinner'></span>}Login
      </button>
      {errors?.root?.responseError ? (
        <span>{errors.root.responseError.message}</span>
      ) : (
        error && <span>Error, try again later.</span>
      )}
    </form>
  );
};

export default LoginForm;
