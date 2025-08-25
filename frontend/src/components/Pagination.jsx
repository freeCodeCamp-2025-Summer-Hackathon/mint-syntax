import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

export class Page {
  number = 0;
  displayNumber = 1;

  constructor(page, displayPage) {
    this.number = page;
    this.displayNumber = displayPage;
  }

  static fromZeroBased(page) {
    return new Page(page, page + 1);
  }

  static fromOneBased(displayPage) {
    return new Page(displayPage - 1, displayPage);
  }
}

export const Pagination = ({
  numberOfPages,
  initialPage,
  getPageUrl,
  fetchPage,
}) => {
  const [activePage, setActivePage] = useState(initialPage);
  const pages = [...Array(numberOfPages).keys()].map(Page.fromZeroBased);
  const { page: paramPageOneBased = '1' } = useParams();

  useEffect(() => {
    const newPage = Page.fromOneBased(parseInt(paramPageOneBased));
    setActivePage(newPage);
    fetchPage(newPage);
  }, [paramPageOneBased, fetchPage]);

  useEffect(() => {
    const handlePopState = () => {
      const newPage = Page.fromOneBased(
        parseInt(window.location.pathname.split('/').pop() || '1')
      );
      setActivePage(newPage);
      fetchPage(newPage);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [fetchPage]);

  const Href = ({ page = null, active = false, children }) => {
    if (page === null || active) {
      return (
        <span className={`nav-link${active ? ' active' : ''}`}>{children}</span>
      );
    }

    const pageUrl = getPageUrl(page);
    const onClick = async e => {
      e.preventDefault();
      await fetchPage(page);
      setActivePage(page);
      window.history.pushState(null, '', pageUrl);
    };
    return (
      <a href={pageUrl} className='nav-link' onClick={onClick}>
        {children}
      </a>
    );
  };

  const NavigateToPrevPage = ({ currentPage }) => (
    <Href
      {...(currentPage.displayNumber > 1 && {
        page: Page.fromZeroBased(currentPage.number - 1),
      })}
    >
      {'<'}
    </Href>
  );

  const NavigateToNextPage = ({ currentPage }) => (
    <Href
      {...(currentPage.displayNumber < numberOfPages && {
        page: Page.fromZeroBased(currentPage.number + 1),
      })}
    >
      {'>'}
    </Href>
  );

  return (
    <div className='nav-list'>
      <NavigateToPrevPage currentPage={activePage} />
      {pages.map(page => (
        <Href
          key={page.number}
          page={page}
          {...(activePage.number === page.number && { active: true })}
        >
          {page.displayNumber}
        </Href>
      ))}
      <NavigateToNextPage currentPage={activePage} />
    </div>
  );
};

export default Pagination;
