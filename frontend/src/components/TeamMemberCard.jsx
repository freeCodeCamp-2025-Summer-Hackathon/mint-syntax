const TeamMemberCard = ({ github_uri, name }) => {
  // Team members data

  return (
    <>
      <span className='team-member'>
        <a
          href={`${guthub_uri || ''}`}
          className='team-link'
          target='_blank'
          rel='noopener noreferrer'
        >
          {name}
        </a>
      </span>
    </>
  );
};

export default TeamMemberCard;
