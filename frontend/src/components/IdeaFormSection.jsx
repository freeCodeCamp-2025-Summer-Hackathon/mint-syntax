import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import UpvoteImg from '../assets/Upvote.svg';
import { useApi } from '../hooks/useApi';
import { Pagination } from './Pagination';
import Spinny from './Spinny';

const IdeaFormSection = ({
  count,
  sort = null,
  page = 0,
  paginate = false,
}) => {
  const [showPages, setShowPages] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [entries, setEntries] = useState([]);
  const { isLoading, error, data, fetchFromApi } = useApi({
    loadingInitially: true,
  });

  const getApiUrl = useCallback(
    (page = 0) => {
      const sorting = sort ? `&sort=${sort}` : '';
      const skip = page > 0 ? `&skip=${page * count}` : '';
      return `/ideas/?limit=${count}${sorting}${skip}`;
    },
    [count, sort]
  );

  const getPageUrl = page => `/ideas/page/${page + 1}`;

  useEffect(() => {
    fetchFromApi(getApiUrl(page));
  }, [fetchFromApi, getApiUrl, page]);

  useEffect(() => {
    if (data?.data?.length > 0) {
      setEntries(data?.data);
    }
  }, [data]);

  useEffect(() => {
    if (data?.count > 0) {
      const pages = Math.ceil(data.count / count);
      setTotalPages(pages);
      if (pages > 1) {
        setShowPages(true);
      }
    }
  }, [data, count]);

  const pagination = useMemo(
    () => (
      <Pagination
        {...{
          numberOfPages: totalPages,
          fetchFromApi,
          getApiUrl,
          getPageUrl,
          initialPage: page,
        }}
      />
    ),
    [totalPages, fetchFromApi, getApiUrl, page]
  );

  return (
    <section className='idea-form-section'>
      <div className='voting-section' tabIndex='0'>
        <h3>Vote on Current Ideas</h3>
        {error ? (
          `${error}`
        ) : isLoading && !entries ? (
          <div className='spinner-wrapper-container'>
            <Spinny />
          </div>
        ) : (
          <ul className='idea-list'>
            {!entries || entries.length === 0
              ? "There's no ideas, add yours!"
              : entries.map(({ id, name, upvoted_by }) => {
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
        {paginate && showPages && entries.length > 0 && <>{pagination}</>}
      </div>
    </section>
  );
};

export default IdeaFormSection;
