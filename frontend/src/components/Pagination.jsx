import { useState } from 'react';

export const Pagination = ({
  numberOfPages,
  initialPage,
  fetchFromApi,
  getApiUrl,
  getPageUrl,
}) => {
  const [currentPage, setCurPage] = useState(initialPage);
  const pages = [...Array(numberOfPages).keys()];

  const Href = ({ pageNo, text }) => {
    const apiUrl = getApiUrl(pageNo);
    const pageUrl = getPageUrl(pageNo);
    const onClick = async e => {
      e.preventDefault();
      await fetchFromApi(apiUrl);
      setCurPage(pageNo);
      window.history.pushState(null, '', pageUrl);
    };
    return (
      <a href={pageUrl} className='nav-link' onClick={onClick}>
        {text}
      </a>
    );
  };

  const NavigateToPrevPage = ({ currentPage }) =>
    currentPage <= 0 ? (
      <span className='nav-link'>{'<'}</span>
    ) : (
      <Href pageNo={currentPage - 1} text={'<'} />
    );

  const NavigateToNextPage = ({ currentPage }) =>
    currentPage >= numberOfPages - 1 ? (
      <span className='nav-link'>{'>'}</span>
    ) : (
      <Href pageNo={currentPage + 1} text={'>'} />
    );

  return (
    <div className='nav-list'>
      <NavigateToPrevPage currentPage={currentPage} />
      {pages.map(pageNo =>
        currentPage !== pageNo ? (
          <Href key={pageNo} pageNo={pageNo} text={pageNo + 1} />
        ) : (
          <a className='nav-link active' key={pageNo}>
            {pageNo + 1}
          </a>
        )
      )}
      <NavigateToNextPage currentPage={currentPage} />
    </div>
  );
};

export default Pagination;
