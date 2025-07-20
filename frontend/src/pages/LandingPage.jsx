import { Link } from 'react-router';
import IdeasList from '../components/IdeasList';
import IdeaSubmissionForm from '../components/IdeaSubmissionForm';
import LandingPageContent from '../components/LandingPageContent';

const LandingPage = () => {
  return (
    <>
      <IdeasList count='3' sort='trending' headerText='Vote on Current Ideas' />
      <IdeaSubmissionForm />
      <LandingPageContent />
      <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
        <Link to='/ideas' className='animated-button golden'>
          Explore All Ideas →
        </Link>
      </div>
    </>
  );
};

export default LandingPage;
