import { useForm } from 'react-hook-form';
import { useUser } from '../hooks/useUser';

export const LoginForm = () => {
  const {
    formState: { isSubmitting, isValid },
    handleSubmit,
    register,
  } = useForm();
  const { login } = useUser();

  const onSubmit = async data => {
    console.log('data', data);
    login({ name: 'placeholder' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
    </form>
  );
};

export default LoginForm;
