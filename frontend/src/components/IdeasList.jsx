import { useCallback, useEffect, useMemo, useState } from 'react';
import { IdeaListItem } from './IdeaListItem';
import { useApi } from '../hooks/useApi';
import { Pagination } from './Pagination';
import Spinny from './Spinny';
import { Link } from 'react-router';

const IdeasList = ({
  base = '/ideas/',
  headerText = 'Vote on Current Ideas',
  noIdeasText = "There's no ideas!",
  count,
  sort = null,
  page = 0,
  paginate = false,
  showExploreButton = false,
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
      return `${base}?limit=${count}${sorting}${skip}`;
    },
    [count, sort, base]
  );

  const getPageUrl = useCallback(page => `${base}page/${page + 1}`, [base]);

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
          getPageUrl,
          initialPage: page,
          fetchPage: async page => {
            await fetchFromApi(getApiUrl(page));
          },
        }}
      />
    ),
    [totalPages, fetchFromApi, getApiUrl, getPageUrl, page]
  );

  return (
    <section className='idea-form-section'>
      <div className='section-card'>
        <h3 className='section-heading'>{headerText}</h3>
        {error ? (
          `${error}`
        ) : isLoading && entries.length === 0 ? (
          <div className='flex items-center justify-center min-h-[100px]'>
            <Spinny />
          </div>
        ) : entries.length === 0 ? (
          <div>
            <p>{noIdeasText}</p>
            <Link to='/ideas/add' className='animated-button'>
              Add idea
            </Link>
          </div>
        ) : (
          <ul className='idea-list'>
            {entries.map(entry => (
              <IdeaListItem key={entry.id} {...entry} />
            ))}
          </ul>
        )}
        {paginate && showPages && entries.length > 0 && <>{pagination}</>}

        {showExploreButton && (
          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
            <Link to='/ideas' className='animated-button golden'>
              Explore All Ideas →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default IdeasList;
