import { useApi } from '../hooks/useApi';
import UpvoteButtonImg from '../assets/UpvoteButton.svg';
import DownvoteButtonImg from '../assets/DownvoteButton.svg';
import { useEffect, useState } from 'react';
import Spinny from './Spinny';
import { SuccessIcon } from './Icons/SuccessIcon';
import { useUser } from '../hooks/useUser';
import { ActionButton } from './Buttons';

const VoteButton = ({
  ideaId,
  fetchAddr,
  buttonProps: { className, ...restButtonProps } = {},
  buttonContents,
  onSuccess,
  onError,
  alreadyVoted,
}) => {
  const { isLogged } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { data, error, sendAsJson } = useApi({ method: 'PUT' });

  const onVote = async event => {
    event.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await sendAsJson(fetchAddr, { idea_id: ideaId });
    } catch (e) {
      console.error(e);
    }
  };

  const buttonClass =
    (className ? className : '') +
    (alreadyVoted ? ' !ring-2 !ring-green-500' : '');

  useEffect(() => {
    if (success) {
      return;
    }

    if (data && !error) {
      setSuccess(true);
      setLoading(false);
      onSuccess();
    }
    if (error) {
      setLoading(false);
      onError(error);
    }
  }, [data, error, success, onError, onSuccess, setLoading, setSuccess]);

  return (
    <div
      {...(!isLogged && {
        className: 'tooltip tooltip-warning',
        'data-tip': 'Login to vote',
      })}
      {...(alreadyVoted && {
        className: 'tooltip tooltip-success',
        'data-tip': 'Already voted!',
      })}
    >
      <ActionButton
        onClick={onVote}
        className={buttonClass}
        {...((loading || !isLogged || alreadyVoted) && { disabled: true })}
        {...restButtonProps}
      >
        {loading ? (
          <Spinny />
        ) : alreadyVoted ? (
          <SuccessIcon size='9' />
        ) : (
          buttonContents
        )}
      </ActionButton>
    </div>
  );
};

export const DownvoteButton = ({
  ideaId,
  onSuccess,
  onError,
  buttonProps,
  alreadyVoted,
  ...restProps
}) => (
  <VoteButton
    {...{
      buttonProps: {
        ...buttonProps,
        className: 'image-only-downvote-button',
      },
      buttonContents: (
        <img src={DownvoteButtonImg} alt='Downvote' className='downvote-icon' />
      ),
      fetchAddr: `/ideas/${ideaId}/downvote`,
      ideaId,
      onSuccess,
      onError,
      alreadyVoted,
      ...restProps,
    }}
  />
);

export const UpvoteButton = ({
  ideaId,
  onSuccess,
  onError,
  buttonProps,
  alreadyVoted = false,
  ...restProps
}) => (
  <VoteButton
    {...{
      buttonProps: {
        ...buttonProps,
        className: 'image-only-upvote-button',
      },
      buttonContents: (
        <img src={UpvoteButtonImg} alt='Upvote' className='upvote-icon' />
      ),
      fetchAddr: `/ideas/${ideaId}/upvote`,
      ideaId,
      onSuccess,
      onError,
      alreadyVoted,
      ...restProps,
    }}
  />
);
