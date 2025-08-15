import { useParams } from 'react-router';
import IdeasList from '../components/IdeasList';
import { Page } from '../components/Pagination';

export const MyIdeasPage = ({ headerText = 'My Ideas' }) => {
  const { page = 1 } = useParams('page');
  return (
    <IdeasList
      {...{
        base: '/me/ideas/',
        count: 20,
        page: Page.fromOneBased(parseInt(page)),
        paginate: true,
        header: headerText,
        noIdeasText: "You don't have any ideas added.",
      }}
    />
  );
};

export default MyIdeasPage;
