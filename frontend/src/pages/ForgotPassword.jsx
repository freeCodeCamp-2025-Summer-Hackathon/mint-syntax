import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  return (
    <div className='max-w-md mx-auto mt-16 p-6 bg-[#f4fdf9] rounded-lg shadow-lg border border-[#cdeee3]'>
      <h1 className='text-2xl font-bold mb-4 text-center text-[#317c67]'>
        🔒 Forgot your password?
      </h1>
      <p className='mb-6 text-gray-600 text-center'>
        Enter your email and we’ll send you reset instructions.
      </p>
      <form>
        <input
          type='email'
          placeholder='you@example.com'
          className='input input-bordered w-full bg-white text-gray-800 mb-4'
          required
        />
        <button
          className='btn w-full bg-[#5dc394] hover:bg-[#49ab7f] text-white'
          type='submit'
        >
          Send reset link
        </button>
      </form>
      <p className='mt-6 text-center text-sm text-gray-500'>
        <Link to='/login' className='text-[#5dc394] hover:underline'>
          ⬅ Back to login
        </Link>
      </p>
    </div>
  );
}
