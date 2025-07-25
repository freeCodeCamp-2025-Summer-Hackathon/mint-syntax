import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { useApi } from '../../hooks/useApi';
import { useUser } from '../../hooks/useUser';
import { IdeaForm } from '../../components/IdeaForm';
import Spinny from '../../components/Spinny';

export const IdeaEditPage = () => {
  const { ideaId } = useParams();
  const { isAdmin, userState } = useUser();
  const [loading, setLoading] = useState(true);
  const { data, error, isLoading, fetchFromApi } = useApi({
    loadingInitially: true,
  });

  useEffect(() => {
    if (data && !error && !isLoading && loading) {
      setLoading(false);
    }
  }, [data, error, isLoading, loading, setLoading]);

  useEffect(() => {
    fetchFromApi(`/ideas/${ideaId}`);
  }, [fetchFromApi, ideaId]);

  const api = useApi({ method: 'PATCH' });

  const onSubmit = async ideaData => {
    try {
      await api.fetchFromApi(`/ideas/${ideaId}`, {
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(ideaData),
      });
    } catch (e) {
      console.error('error', e);
    }
  };

  return loading ? (
    <Spinny />
  ) : isAdmin || data?.creator_id === userState.id ? (
    <IdeaForm
      {...{
        api,
        initialData: data,
        disableSubmit: ({ loading, success, isDirty }) =>
          loading || success || !isDirty,
        buttonText: 'Edit Idea',
        headerText: 'Edit Idea',
        onSubmit,
      }}
    />
  ) : (
    <>Access denied</>
  );
};

export default IdeaEditPage;
