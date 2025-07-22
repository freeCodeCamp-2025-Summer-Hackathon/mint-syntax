import { useParams } from 'react-router';
import IdeasList from '../../components/IdeasList';

export const IdeasPage = ({ headerText = 'All Ideas' }) => {
  const { page = 1 } = useParams('page');
  return (
    <IdeasList {...{ count: 20, page: page - 1, paginate: true, headerText }} />
  );
};

export default IdeasPage;
