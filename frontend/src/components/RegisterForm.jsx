import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useApi } from '../hooks/useApi';

export function RegisterForm() {
  const formRef = useRef();
  const {
    //formState: { },
    handleSubmit,
    register,
  } = useForm();

  const { fetchFromApi } = useApi({ method: 'POST' });

  const onSubmit = async () => {
    console.log(formRef);
    try {
      await fetchFromApi('/users', {
        method: 'POST',
        body: new FormData(formRef.current),
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label className='floating-label'>
        Username:
        <label className='input input-sm'>
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

          <input
            {...register('userName')}
            type='Text'
            placeholder='Username'
            className='input-validator'
            required
            //pattern='[A-Za-z][A-Za-z0-9\-]*'
            //title='Only letters, numbers or dash'
            defaultValue={'bob'}
          />
        </label>
      </label>

      <label className='floating-label'>
        Name:
        <label className='input input-sm'>
          <input
            {...register('name')}
            type='Text'
            placeholder='Name'
            className='input-validator'
            required
            //pattern='[A-Za-z][A-Za-z0-9\-]*'
            //title='Only letters, numbers or dash'
            defaultValue={'bob'}
          />
        </label>
      </label>

      <label className='floating-label'>
        Password:
        <label className='input input-sm'>
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

          <input
            {...register('password')}
            type='Password'
            placeholder='Password'
            className='input-validator'
            minLength='8'
            required
            /*pattern='(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}'*/
            //title='Must be more than 8 characters, including number, lowercase letter, uppercase letter'
            defaultValue={'123'}
          />
        </label>
      </label>
      {/*
          <label className='form-label'>
            Repeat Password:
          </label>

          <label class='input input-sm'>
            <svg
              class='h-[1em] opacity-50'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
            >
              <g
                stroke-linejoin='round'
                stroke-linecap='round'
                stroke-width='2.5'
                fill='none'
                stroke='currentColor'
              >
                <path d='M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z'></path>
                <circle cx='16.5' cy='7.5' r='.5' fill='currentColor'></circle>
              </g>
            </svg>
            <input
              name='passwordRepeat'
              //{...register('password2', { required: true })}
              type='password'
              //required
              placeholder='Password'
              //pattern='(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}'
              title='Must match the password entered in the previous input field'
            />
          </label>
          */}

      <div>
        <button className='my-1 animated-button'>Register</button>
      </div>
    </form>
  );
}

export default RegisterForm;
