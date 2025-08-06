import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { PasswordIcon } from './Icons/PasswordIcon';
import { UserIcon } from './Icons/UserIcon';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import { SubmitButton } from './Buttons';

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

  const { error, response, data, sendFormData } = useApi({ method: 'POST' });

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
      await sendFormData('/users', { formRef });
    } catch (e) {
      console.log('error!', e);
    }
  };

  return (
    <form
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
          The field &quot;Username&quot; is required.
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
          The field &quot;Name&quot; is required.
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
          The field &quot;Password&quot; is required.
        </p>
      ) : (
        errors.password?.type === 'minLength' && (
          <p role='alert' className='text-error text-xs mt-0.5'>
            The password needs to be at least 8 characters long.
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
          The field &quot;Repeat Password&quot; is required.
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
        <SubmitButton disabled={isSubmitting}>Register</SubmitButton>
      </div>
    </form>
  );
}

export default RegisterForm;
