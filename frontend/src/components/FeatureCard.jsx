const FeatureCard = ({ title, description, Icon }) => {
  return (
    <div className='feature-card'>
      <Icon className='feature-icon' />
      <h3 className='feature-title'>{title}</h3>
      <p className='feature-description'>{description}</p>
    </div>
  );
};

export default FeatureCard;
