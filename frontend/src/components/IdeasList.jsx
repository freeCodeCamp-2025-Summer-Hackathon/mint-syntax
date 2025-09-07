import { useCallback, useEffect, useMemo, useState } from 'react';
import { IdeaListItem } from './IdeaListItem';
import { useApi } from '../hooks/useApi';
import { Page, Pagination } from './Pagination';
import Spinny from './Spinny';
import { Link, useLocation } from 'react-router';

const IdeasList = ({
  base = '/ideas/',
  header = 'Vote on Current Ideas',
  noIdeasText = "There's no ideas!",
  addNewButton = true,
  count,
  sort = null,
  page: initialPage = Page.fromZeroBased(0),
  paginate = false,
  showExploreButton = false,
}) => {
  const [showPages, setShowPages] = useState(false);
  const [headerText, setHeaderText] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(initialPage);
  const { isLoading, error, data, fetchFromApi } = useApi({
    loadingInitially: true,
  });
  const location = useLocation();

  const getApiUrl = useCallback(
    pageToFetch => {
      const sorting = sort ? `&sort=${sort}` : '';
      const skip =
        pageToFetch.number > 0 ? `&skip=${pageToFetch.number * count}` : '';
      return `${base}?limit=${count}${sorting}${skip}`;
    },
    [count, sort, base]
  );

  const getPageUrl = useCallback(
    page => `${base}page/${page.displayNumber}`,
    [base]
  );

  const getPageFromLocation = () => {
    const match = location.pathname.match(/page\/(\d+)/);
    const pageOneBased = match ? parseInt(match[1], 10) : 1;
    return Page.fromOneBased(pageOneBased);
  };

  const fetchPage = async paginationPage => {
    setPage(paginationPage);
    await fetchFromApi(getApiUrl(paginationPage));
  };

  useEffect(() => {
    const skip = page.number > 0 ? `&skip=${page.number * count}` : '';
    const sorting = sort ? `&sort=${sort}` : '';
    const fetchUrl = `${base}?limit=${count}${sorting}${skip}`;
    fetchFromApi(fetchUrl);
  }, [fetchFromApi, base, count, sort, page]);

  useEffect(() => {
    if (data?.data) {
      setHeaderText(typeof header === 'string' ? header : header(data));
    }
    if (data?.data?.length > 0) {
      setEntries(data?.data);
    }
  }, [data, header]);

  useEffect(() => {
    if (data?.count > 0) {
      const pages = Math.ceil(data.count / count);
      setTotalPages(pages);
      if (pages > 1) {
        setShowPages(true);
      }
    }
  }, [data, count]);

  useEffect(() => {
    const handlePopState = () => {
      const newPage = getPageFromLocation();
      fetchPage(newPage);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
    // Include location in deps to update when URL changes
  }, [location, fetchFromApi, getApiUrl]);

  const pagination = useMemo(
    () => (
      <Pagination
        {...{
          numberOfPages: totalPages,
          getPageUrl,
          initialPage: page,
          fetchPage,
        }}
      />
    ),
    [totalPages, fetchPage, getPageUrl, page]
  );

  return (
    <section className='idea-form-section'>
      <div className='section-card'>
        {!error &&
          (headerText ? (
            <h3 className='section-heading'>{headerText}</h3>
          ) : (
            <Spinny />
          ))}
        {error ? (
          `${error}`
        ) : isLoading && entries.length === 0 ? (
          <div className='flex items-center justify-center min-h-[100px]'>
            <Spinny />
          </div>
        ) : entries.length === 0 && page.displayNumber == 1 ? (
          <div>
            <p>{noIdeasText}</p>
            {addNewButton && (
              <Link to='/ideas/add' className='animated-button'>
                Add idea
              </Link>
            )}
          </div>
        ) : (
          <ul className='idea-list'>
            {entries.map(entry => (
              <IdeaListItem key={entry.id} {...entry} />
            ))}
          </ul>
        )}
        {paginate &&
          showPages &&
          (entries.length > 0 || page.displayNumber > 1) && <>{pagination}</>}
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
