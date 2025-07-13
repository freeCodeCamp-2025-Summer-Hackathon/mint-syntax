import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';

const IdeaFormSection = ({ count }) => {
  let [isLoading, setLoading] = useState(true);
  let [error, setError] = useState(null);
  let [data, setData] = useState([]);

  const fetchIdeas = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(
        import.meta.env.VITE_API_LOCATION + `/ideas/?limit=${count}`
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      setLoading(false);
      setData((await response?.json())?.data);
    } catch (e) {
      console.error(e);
      setError(e);
    }
  }, [count]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

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
            {data.length === 0
              ? "There's no ideas, add yours!"
              : data.map(({ id, name, upvoted_by }) => {
                  return (
                    <Link to={`/ideas/${id}`} key={id}>
                      <li className='idea-item'>
                        <span className='idea-text'>{name}</span>
                        <div className='vote-controls'>
                          <form onSubmit={() => {}}>
                            <button className='image-only-upvote-button'>
                              <img
                                src='https://i.ibb.co/DfxLPp7g/Upvote-transparent-2.png'
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

export default IdeaFormSection; //
