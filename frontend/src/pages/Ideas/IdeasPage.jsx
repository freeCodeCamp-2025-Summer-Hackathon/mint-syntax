import { useParams } from 'react-router';
import IdeasList from '../../components/IdeasList';
import { Page } from '../../components/Pagination';

export const IdeasPage = ({ headerText = 'All Ideas' }) => {
  const { page: pageOneBased = 1 } = useParams('page');
  return (
    <IdeasList
      {...{
        count: 20,
        page: Page.fromOneBased(parseInt(pageOneBased)),
        paginate: true,
        header: headerText,
      }}
    />
  );
};

export default IdeasPage;
