import { useParams } from 'react-router';
import IdeasList from '../components/IdeasList';
import { Page } from '../components/Pagination';

export const VotesList = ({ which }) => {
  const { page = 1 } = useParams('page');
  return (
    <IdeasList
      {...{
        base: `/me/${which}/`,
        count: 20,
        page: Page.fromOneBased(parseInt(page)),
        paginate: true,
        header: `My ${which[0].toUpperCase() + which.slice(1)}`,
        noIdeasText: `You don't have any ${which}.`,
        addNewButton: false,
      }}
    />
  );
};

export default VotesList;
