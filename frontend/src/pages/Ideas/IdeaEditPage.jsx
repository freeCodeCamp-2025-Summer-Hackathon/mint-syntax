import { useParams } from 'react-router';

export const IdeaEditPage = () => {
  const { ideaId } = useParams();
  return <>edit {ideaId}</>;
};

export default IdeaEditPage;
