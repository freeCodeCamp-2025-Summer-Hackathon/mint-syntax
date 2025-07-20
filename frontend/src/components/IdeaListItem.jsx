import { useState } from 'react';
import { Link } from 'react-router';

import { UpvoteButton } from './VoteButtons';

export const IdeaListItem = ({ id, name, upvoted_by }) => {
  const [idea, setIdea] = useState({
    id,
    name,
    upvotes: upvoted_by.length,
  });
  const [isUpvoted, setIsUpvoted] = useState(false);

  const onSuccess = () => {
    if (!isUpvoted) {
      setIdea(idea => ({
        ...idea,
        upvotes: idea.upvotes + 1,
      }));
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
          <UpvoteButton {...{ ideaId: idea.id, onSuccess, onError }} />
          <span className='vote-count'>{idea.upvotes}</span>
        </div>
      </li>
    </Link>
  );
};

export default IdeaListItem;
