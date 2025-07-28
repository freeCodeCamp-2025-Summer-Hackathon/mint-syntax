import { useState } from 'react';
import { Link } from 'react-router';

import { UpvoteButton } from './VoteButtons';
import { useUser } from '../hooks/useUser';

export const IdeaListItem = ({ id, name, upvoted_by }) => {
  const { userState, dispatch } = useUser();
  const [idea, setIdea] = useState({
    id,
    name,
    upvotes: upvoted_by.length,
  });
  const [isUpvoted, setIsUpvoted] = useState(userState?.upvotes?.has(id));

  const onSuccess = () => {
    if (!isUpvoted) {
      setIdea(idea => ({
        ...idea,
        upvotes: idea.upvotes + 1,
      }));
      dispatch({ type: 'upvote', ideaId: id });
      setIsUpvoted(true);
    }
  };

  const onError = error => {
    console.error(error);
  };

  return (
    <Link to={`/ideas/${idea.id}`}>
      <li className='idea-item'>
        <span className='idea-text'>{idea.name}</span>
        <div className='vote-controls'>
          <UpvoteButton
            {...{
              ideaId: idea.id,
              onSuccess,
              onError,
              ...(isUpvoted && {
                buttonProps: { disabled: true },
                alreadyVoted: true,
              }),
            }}
          />
          <span className='vote-count'>{idea.upvotes}</span>
        </div>
      </li>
    </Link>
  );
};

export default IdeaListItem;
