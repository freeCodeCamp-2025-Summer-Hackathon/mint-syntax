import { Link } from 'react-router';

export default function LogoutPage() {
  return (
    <div className='max-w-md mx-auto mt-16 p-6 bg-[#f4fdf9] rounded-lg shadow-lg border border-[#cdeee3]'>
      <h1 className='text-2xl font-bold mb-4 text-center text-[#317c67]'>
        👋 You're logged out
      </h1>
      <p className='mb-6 text-gray-600 text-center'>
        Thanks for using Idea Forge. You can log in again below.
      </p>
      <Link
        to='/login'
        className='btn w-full bg-[#5dc394] hover:bg-[#49ab7f] text-white'
      >
        ⬅ Back to login
      </Link>
    </div>
  );
}
