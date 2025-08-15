import { useParams } from 'react-router';
import IdeasList from '../components/IdeasList';
import { Page } from '../components/Pagination';

const UserIdeasPage = () => {
  const { id, page = 1 } = useParams();

  return (
    <IdeasList
      {...{
        base: `/users/${id}/ideas/`,
        count: 20,
        page: Page.fromOneBased(parseInt(page)),
        paginate: true,
        header: data => `Ideas from ${data?.username}`,
        noIdeasText: 'No ideas added.',
        addNewButton: false,
      }}
    />
  );
};

export default UserIdeasPage;
