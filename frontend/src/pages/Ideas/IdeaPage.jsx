import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';

import { useApi } from '../../hooks/useApi';
import Spinny from '../../components/Spinny';
import { useUser } from '../../hooks/useUser';
import { DownvoteButton, UpvoteButton } from '../../components/VoteButtons';
import { ErrorElement } from '../../components/Errors';

export const IdeaPage = () => {
  const { ideaId } = useParams();
  const { isAdmin, isLogged, userState, upvote, downvote } = useUser();
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState({
    upvoted: userState.upvotes.has(ideaId),
    downvoted: userState.downvotes.has(ideaId),
  });
  const { error, data, fetchFromApi } = useApi({
    loadingInitially: true,
  });

  const [idea, setIdea] = useState();

  const onUpvoteSuccess = () => {
    if (!voting.upvoted) {
      setIdea(idea => ({
        ...idea,
        upvotes: idea.upvotes + 1,
        ...(voting.downvoted && { downvotes: idea.downvotes - 1 }),
      }));
      upvote(ideaId);
      setVoting({
        upvoted: true,
        downvoted: false,
      });
    }
  };

  const onError = error => {
    console.error(error);
  };

  const onDownvoteSuccess = () => {
    if (!voting.downvoted) {
      setIdea(idea => ({
        ...idea,
        downvotes: idea.downvotes + 1,
        ...(voting.upvoted && { upvotes: idea.upvotes - 1 }),
      }));
      downvote(ideaId);
      setVoting({
        upvoted: false,
        downvoted: true,
      });
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
        creatorId: data?.creator_id,
        name: data?.name,
        description: data?.description,
        upvotes: data?.upvoted_by?.length,
        downvotes: data?.downvoted_by?.length,
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
    <div className='section-card flex flex-col items-center justify-center min-h-[60vh]'>
      <ErrorElement>Error: {error.message}</ErrorElement>
    </div>
  ) : (
    <section className='section-card'>
      <h1 className='section-heading'>{idea?.name}</h1>
      <p className='text-lg text-gray-700 mb-4'>{idea?.description}</p>
      <div className='stats stats-vertical lg:stats-horizontal shadow my-4'>
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
        <div className='flex gap-4 mt-4 justify-center'>
          <UpvoteButton
            {...{
              ideaId,
              onSuccess: onUpvoteSuccess,
              onError,
              alreadyVoted: voting.upvoted,
            }}
          />
          <DownvoteButton
            {...{
              ideaId,
              onSuccess: onDownvoteSuccess,
              onError,
              alreadyVoted: voting.downvoted,
            }}
          />
        </div>
      )}
      {(isAdmin || userState.id === idea.creatorId) && (
        <Link className='animated-button' to={`edit`}>
          Edit
        </Link>
      )}
    </section>
  );
};

export default IdeaPage;
