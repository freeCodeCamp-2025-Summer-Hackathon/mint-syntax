import { useParams } from 'react-router';
import IdeaFormSection from '../../components/IdeaFormSection';

export const IdeasPage = () => {
  const { page = 1 } = useParams('page');
  return <IdeaFormSection {...{ count: 20, page: page - 1, paginate: true }} />;
};

export default IdeasPage;
