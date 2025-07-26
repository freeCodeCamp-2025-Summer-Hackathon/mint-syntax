import { useCallback, useEffect, useMemo, useState } from 'react';
import { IdeaListItem } from './IdeaListItem';
import { useApi } from '../hooks/useApi';
import { Pagination } from './Pagination';
import Spinny from './Spinny';

const IdeasList = ({
  base = '/ideas/',
  headerText = 'Vote on Current Ideas',
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
      return `${base}?limit=${count}${sorting}${skip}`;
    },
    [count, sort, base]
  );

  const getPageUrl = page => `${base}page/${page + 1}`;

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
    [totalPages, fetchFromApi, getApiUrl, getPageUrl, page]
  );

  return (
    <section className='idea-form-section'>
      <div className='section-card' tabIndex='0'>
        <h3 className='section-heading'>{headerText}</h3>
        {error ? (
          `${error}`
        ) : isLoading && entries.length === 0 ? (
          <div className='spinner-wrapper-container'>
            <Spinny />
          </div>
        ) : (
          <ul className='idea-list'>
            {entries.length === 0
              ? "There's no ideas, add yours!"
              : entries.map(entry => (
                  <IdeaListItem key={entry.id} {...entry} />
                ))}
          </ul>
        )}
        {paginate && showPages && entries.length > 0 && <>{pagination}</>}
      </div>
    </section>
  );
};

export default IdeasList;
