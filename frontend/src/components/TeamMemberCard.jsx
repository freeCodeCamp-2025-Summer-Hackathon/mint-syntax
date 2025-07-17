const TeamMemberCard = ({ github_uri, name }) => {
  // Team members data

  return (
    <span className='team-member'>
      {github_uri ? (
        <a
          href={github_uri}
          className='team-link'
          target='_blank'
          rel='noopener noreferrer'
        >
          {name}
        </a>
      ) : (
        name
      )}
    </span>
  );
};

export default TeamMemberCard;
