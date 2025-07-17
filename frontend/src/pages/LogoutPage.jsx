import { Link } from 'react-router-dom';

export default function LogoutPage() {
  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow text-center">
      <h2 className="text-xl font-semibold mb-4">👋 You've been logged out</h2>
      <p className="text-gray-600 mb-6">Thanks for visiting Idea Forge!</p>
      <Link to="/login" className="btn btn-outline">
        Back to Login
      </Link>
    </div>
  );
}