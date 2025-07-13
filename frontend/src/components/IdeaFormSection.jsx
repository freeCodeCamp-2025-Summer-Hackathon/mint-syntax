import { useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { Link } from 'react-router';
import UpvoteImg from "../assets/Upvote.svg"

const IdeaFormSection = ({ count }) => {
  const { isLoading, error, data, fetchFromApi } = useApi({
    loadingInitially: true,
  });

  useEffect(() => {
    fetchFromApi(`/ideas/?limit=${count}`);
  }, [count, fetchFromApi]);

  return (
    <section className='idea-form-section'>
      <div className='voting-section' tabIndex='0'>
        <h3>Vote on Current Ideas</h3>
        {error ? (
          `${error}`
        ) : isLoading ? (
          'Loading...'
        ) : (
          <ul className='idea-list'>
            {data?.data?.length === 0
              ? "There's no ideas, add yours!"
              : data?.data.map(({ id, name, upvoted_by }) => {
                  return (
                    <Link to={`/ideas/${id}`} key={id}>
                      <li className='idea-item'>
                        <span className='idea-text'>{name}</span>
                        <div className='vote-controls'>
                          <form onSubmit={() => {}}>
                            <button className='image-only-upvote-button'>
                              <img
                                src={UpvoteImg}
                                alt='Upvote'
                                className='upvote-icon'
                              />
                            </button>
                          </form>
                          <span className='vote-count'>
                            {upvoted_by?.length}
                          </span>
                        </div>
                      </li>
                    </Link>
                  );
                })}
          </ul>
        )}
      </div>
    </section>
  );
};

export default IdeaFormSection;
