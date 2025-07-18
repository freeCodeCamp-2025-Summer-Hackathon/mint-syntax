import { useParams } from 'react-router';
import IdeaFormSection from '../../components/IdeaFormSection';

export const IdeasPage = ({ headerText = 'All Ideas' }) => {
  const { page = 1 } = useParams('page');
  return (
    <IdeaFormSection
      {...{ count: 20, page: page - 1, paginate: true, headerText }}
    />
  );
};

export default IdeasPage;
