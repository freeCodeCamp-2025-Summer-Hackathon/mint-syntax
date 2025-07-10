import { useId } from 'react';

function RegisterForm() {
  const name = useId();
  const password = useId();
  const repeatPassword = useId();
  return (
    <section className='voting-section flex flex-col justify-center items-center'>
      <h3>Register as a new user:</h3>

      <div className='card bg-base-100 w-lg p-4 auto'>
        <form className='flex flex-col justify-center items-center'>
          <label htmlFor={name} className='form-label'>
            Username:
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
                <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'></path>
                <circle cx='12' cy='7' r='4'></circle>
              </g>
            </svg>
            <input
              id={name}
              type='text'
              required
              placeholder='Username'
              pattern='[A-Za-z][A-Za-z0-9\-]*'
              title='Only letters, numbers or dash'
            />
          </label>

          <label htmlFor={password} className='form-label'>
            Password:
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
              id={password}
              type='password'
              required
              placeholder='Password'
              pattern='(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}'
              title='Must be more than 8 characters, including number, lowercase letter, uppercase letter'
            />
          </label>

          <label htmlFor={repeatPassword} className='form-label'>
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
              id={repeatPassword}
              type='password'
              required
              placeholder='Password'
              pattern='(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}'
              title='Must match the password entered in the previous input field'
            />
          </label>
          <div>
            <button className='my-1 animated-button'>Register</button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default RegisterForm;
