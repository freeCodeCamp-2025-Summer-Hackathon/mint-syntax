import { useApi } from '../hooks/useApi';
import { IdeaForm } from './IdeaForm';

const IdeaSubmissionForm = () => {
  const api = useApi({ method: 'POST' });

  const onSubmit = async ideaData => {
    try {
      await api.sendAsJson('/ideas', ideaData);
    } catch (e) {
      console.error('error', e);
    }
  };

  return (
    <IdeaForm
      {...{
        api,
        disableSubmit: ({ loading, success, isLogged }) =>
          loading || success || !isLogged,
        buttonText: 'Start Your IdeaForge',
        headerText: 'Submit Your New Idea',
        onSubmit,
      }}
    />
  );
};

export default IdeaSubmissionForm;
