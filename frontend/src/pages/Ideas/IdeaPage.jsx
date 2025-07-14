import { useParams } from 'react-router';

export const IdeaPage = () => {
  const { ideaId } = useParams();
  return <>{ideaId}</>;
};

export default IdeaPage;
