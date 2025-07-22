import { useParams } from 'react-router';
const UserEditPage = () => {
  const { id } = useParams(); // Get the user ID from the URL

  return (
    <div className='section-card flex flex-col items-center justify-center min-h-[60vh]'>
      <h1 className='section-heading'>Edit User: {id}</h1>
      <p className='text-lg text-gray-600 mb-8'>
        This page will contain the form to edit the profile for user with ID:{' '}
        {id}.
      </p>
    </div>
  );
};

export default UserEditPage;
