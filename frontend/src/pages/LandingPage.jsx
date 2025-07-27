import IdeasList from '../components/IdeasList';
import IdeaSubmissionForm from '../components/IdeaSubmissionForm';
import LandingPageContent from '../components/LandingPageContent';

const LandingPage = () => {
  return (
    <>
      <IdeasList
        count='3'
        sort='trending'
        headerText='Vote on Current Ideas'
        showExploreButton={true}
      />
      <IdeaSubmissionForm />
      <LandingPageContent />
    </>
  );
};

export default LandingPage;
