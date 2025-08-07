const TeamMemberCard = ({ github_uri, name }) => {
  const baseButtonStyles =
    'w-full block py-3 px-6 rounded-xl font-bold transition-all duration-300 ease-in-out text-center';

  const linkStyles =
    'bg-[#f8f8f8] border-2 border-[#e0e0e0] text-[#2c7873] hover:bg-[#e0e0e0] hover:border-[#1a5b57] hover:text-[#1a5b57] active:bg-[#1a5b57] active:text-[#f8f8f8] active:border-[#1a5b57] hover:shadow-md transform hover:scale-105';

  const nonLinkStyles =
    'bg-[#e0e0e0] text-[#777777] border-2 border-[#e0e0e0] cursor-not-allowed';

  if (github_uri) {
    return (
      <a
        href={github_uri}
        className={`${baseButtonStyles} ${linkStyles}`}
        target='_blank'
        rel='noopener noreferrer'
      >
        <span className='block'>{name}</span>
      </a>
    );
  }

  return (
    <span className={`${baseButtonStyles} ${nonLinkStyles}`}>
      <span className='block'>{name}</span>
    </span>
  );
};

export default TeamMemberCard;
