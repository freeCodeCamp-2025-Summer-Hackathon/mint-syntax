import { Link } from 'react-router';

export default function ForgotPassword() {
  return (
    <div className='container-wrapper'>
      <section className='section-card flex flex-col justify-center items-center'>
        <h3 className='section-heading'>Forgot your password?</h3>

        <div className='card bg-base-100 w-lg p-4 auto'>
          <p className='mb-6 text-gray-600 text-center'>
            Enter your email and we’ll send you reset instructions.
          </p>

          <form>
            <div className='form-group'>
              <label htmlFor='email' className='form-label'>
                Email address: <span className='text-red-500'>*</span>
              </label>
              <label className='input input-sm'>
                <input
                  id='email'
                  type='email'
                  placeholder='you@example.com'
                  className='input-validator'
                  required
                />
              </label>
            </div>

            <div className='flex justify-center mt-2'>
              <button type='submit' className='my-1 animated-button'>
                Send reset link
              </button>
            </div>
          </form>

          <div className='text-center mt-6 text-sm'>
            <Link to='/login' className='link link-hover'>
              ⬅ Back to login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
