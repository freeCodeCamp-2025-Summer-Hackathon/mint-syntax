import { useParams } from 'react-router';
import IdeasList from '../components/IdeasList';

export const MyIdeasPage = ({ headerText = 'My Ideas' }) => {
  const { page = 1 } = useParams('page');
  return (
    <IdeasList
      {...{
        base: '/me/ideas/',
        count: 20,
        page: page - 1,
        paginate: true,
        headerText,
        noIdeasText: "You don't have any ideas added.",
      }}
    />
  );
};

export default MyIdeasPage;
