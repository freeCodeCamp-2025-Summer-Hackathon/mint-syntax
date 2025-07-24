import { useParams } from 'react-router';
import IdeasList from '../components/IdeasList';

const UserIdeasPage = () => {
  const { id } = useParams();

  return (
    <div className='section-card flex flex-col items-center min-h-[60vh]'>
      <h1 className='section-heading'>Ideas by User: {id}</h1>
      <IdeasList
        userId={id}
        headerText={`Ideas by User: ${id}`}
        count={10}
        paginate={true}
      />
    </div>
  );
};

export default UserIdeasPage;
