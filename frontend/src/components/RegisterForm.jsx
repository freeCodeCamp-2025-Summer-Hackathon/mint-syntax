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
    formState: { errors, isSubmitting, isValid },
    handleSubmit,
    register,
    getValues,
  } = useForm();
  const { isLogged, login } = useUser();
  const navigate = useNavigate();

  const { error, response, data, fetchFromApi } = useApi({ method: 'POST' });

  useEffect(() => {
    if (data && !error) {
      login(data);
    }
    if (error) {
      console.log('Error:', error);
    }
  }, [response, data, error, login]);

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
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      <label className='floating-label flex justify-between py-2'>
        Username: <span className='text-red-500'>*</span>
        <label className='input input-sm'>
          <UserIcon />
          <input
            {...register('username', { required: true })}
            type='Text'
            placeholder='Username'
            className='input-validator'
            aria-invalid={!!errors.username}
          />
        </label>
      </label>
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

      <label className='floating-label flex justify-between py-2'>
        Name: <span className='text-red-500'>*</span>
        <label className='input input-sm'>
          <UserIcon />
          <input
            {...register('name', { required: true })}
            type='Text'
            placeholder='Name'
            className='input-validator'
            aria-invalid={!!errors.name}
          />
        </label>
      </label>
      {errors.name?.type === 'required' && (
        <p role='alert' className='text-error'>
          The field "Name" is required.
        </p>
      )}

      <label className='floating-label flex justify-between py-2'>
        Password: <span className='text-red-500'>*</span>
        <label className='input input-sm'>
          <PasswordIcon />
          <input
            {...register('password', { required: true, minLength: 8 })}
            type='Password'
            placeholder='Password'
            className='input-validator'
            aria-invalid={!!errors.password}
          />
        </label>
      </label>
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

      <label className='floating-label flex justify-between py-2'>
        Repeat Password: <span className='text-red-500'>*</span>
        <label className='input input-sm'>
          <PasswordIcon />
          <input
            {...register('repeatPassword', {
              required: true,
              validate: value => getValues('password') === value,
            })}
            type='password'
            placeholder='Password'
            title='Must match the password entered in the previous input field'
            aria-invalid={!!errors.repeatPassword}
          />
        </label>
      </label>
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

      <div className='flex justify-center'>
        <button
          className='my-1 animated-button'
          {...((isSubmitting || !isValid) && { disabled: 'disabled' })}
        >
          Register
        </button>
      </div>
    </form>
  );
}

export default RegisterForm;
