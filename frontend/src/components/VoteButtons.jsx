import { useApi } from '../hooks/useApi';
import UpvoteButtonImg from '../assets/UpvoteButton.svg';
import DownvoteButtonImg from '../assets/DownvoteButton.svg';
import { useEffect, useState } from 'react';
import Spinny from './Spinny';
import { useUser } from '../hooks/useUser';

const SuccessIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-9 w-9 shrink-0 stroke-current'
    fill='none'
    width='100%'
    height='100%'
    viewBox='0 0 24 24'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    />
  </svg>
);

const Button = ({
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
  const { data, error, fetchFromApi } = useApi({ method: 'PUT' });

  const onVote = async event => {
    event.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await fetchFromApi(fetchAddr, {
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idea_id: ideaId }),
      });
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
      <button
        onClick={onVote}
        className={buttonClass}
        {...((loading || !isLogged || alreadyVoted) && { disabled: true })}
        {...restButtonProps}
      >
        {loading ? <Spinny /> : alreadyVoted ? <SuccessIcon /> : buttonContents}
      </button>
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
  <Button
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
  <Button
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
