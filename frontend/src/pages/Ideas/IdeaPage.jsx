import { useEffect } from 'react';
import { useParams } from 'react-router';

import { useApi } from '../../hooks/useApi';
import Spinny from '../../components/Spinny';

export const IdeaPage = () => {
  const { ideaId } = useParams();
  const { isLoading, error, data, fetchFromApi } = useApi({
    loadingInitially: true,
  });

  useEffect(() => {
    fetchFromApi(`/ideas/${ideaId}`);
  }, [fetchFromApi, ideaId]);

  return isLoading ? (
    <Spinny />
  ) : error ? (
    <>{error}</>
  ) : (
    <section>
      <h1 className='header'>{data?.name}</h1>
      <p>{data?.description}</p>
      <div className='stats stats-vertical lg:stats-horizontal shadow'>
        <div className='stat'>
          <div className='stat-title'>Upvotes</div>
          <div className='stat-value'>{data?.upvoted_by.length}</div>
        </div>

        <div className='stat'>
          <div className='stat-title'>Downvotes</div>
          <div className='stat-value'>{data?.downvoted_by.length}</div>
        </div>
      </div>
    </section>
  );
};

export default IdeaPage;
