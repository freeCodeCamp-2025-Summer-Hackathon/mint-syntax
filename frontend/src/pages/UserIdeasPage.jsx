import { useParams } from 'react-router';

const UserIdeasPage = () => {
  const { id } = useParams();

  return (
    <div className='section-card flex flex-col items-center justify-center min-h-[60vh]'>
      <h1 className='section-heading'>Ideas by User: {id}</h1>
      <p className='text-lg text-gray-600 mb-8'>
        This page will list all ideas submitted by user with ID: {id}.
      </p>
      <p className='text-sm text-gray-500'>
        (Functionality to fetch and display user ideas should be added here.)
      </p>
    </div>
  );
};

export default UserIdeasPage;
