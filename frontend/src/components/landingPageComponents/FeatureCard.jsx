const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className='feature-card'>
      <svg
        className='feature-icon'
        fill='currentColor'
        viewBox='0 0 24 24'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d={icon}
        ></path>
      </svg>
      <h3 className='feature-title'>{title}</h3>
      <p className='feature-description'>{description}</p>
    </div>
  );
};

export default FeatureCard;
