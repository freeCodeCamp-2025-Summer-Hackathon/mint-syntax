import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { useApi } from '../../hooks/useApi';
import Spinny from '../../components/Spinny';
import { useUser } from '../../hooks/useUser';
import { DownvoteButton, UpvoteButton } from '../../components/VoteButtons';

export const IdeaPage = () => {
  const { ideaId } = useParams();
  const { isLogged } = useUser();
  const [loading, setLoading] = useState(true);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  const { error, data, fetchFromApi } = useApi({
    loadingInitially: true,
  });

  const [idea, setIdea] = useState();

  const onUpvoteSuccess = () => {
    if (!isUpvoted) {
      setIdea(idea => ({
        ...idea,
        upvotes: idea.upvotes + 1,
        ...(isDownvoted && { downvotes: idea.downvotes - 1 }),
      }));
      setIsUpvoted(true);
    }
  };

  const onError = error => {
    console.error(error);
  };

  const onDownvoteSuccess = () => {
    if (!isDownvoted) {
      setIdea(idea => ({
        ...idea,
        downvotes: idea.downvotes + 1,
        ...(isUpvoted && { upvotes: idea.upvotes - 1 }),
      }));
      setIsDownvoted(true);
    }
  };

  useEffect(() => {
    if (idea && loading) {
      setLoading(false);
    }
  }, [idea, loading, setLoading]);

  useEffect(() => {
    if (data && loading) {
      setIdea({
        name: data?.name,
        description: data?.description,
        upvotes: data?.upvoted_by.length,
        downvotes: data?.downvoted_by.length,
      });
      setLoading(false);
    }
  }, [data, loading, setLoading, setIdea]);

  useEffect(() => {
    fetchFromApi(`/ideas/${ideaId}`);
  }, [fetchFromApi, ideaId]);

  return loading ? (
    <Spinny />
  ) : error ? (
    <>{error}</>
  ) : (
    <section>
      <h1 className='header'>{idea?.name}</h1>
      <p>{idea?.description}</p>
      <div className='stats stats-vertical lg:stats-horizontal shadow'>
        <div className='stat'>
          <div className='stat-title'>Upvotes</div>
          <div className='stat-value'>{idea?.upvotes}</div>
        </div>

        <div className='stat'>
          <div className='stat-title'>Downvotes</div>
          <div className='stat-value'>{idea?.downvotes}</div>
        </div>
      </div>
      {isLogged && (
        <>
          <UpvoteButton {...{ ideaId, onSuccess: onUpvoteSuccess, onError }} />
          <DownvoteButton
            {...{
              ideaId,
              onSuccess: onDownvoteSuccess,
              onError,
            }}
          />
        </>
      )}
    </section>
  );
};

export default IdeaPage;
