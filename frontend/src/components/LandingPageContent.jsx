import FeatureCard from './FeatureCard';
import TeamMemberCard from './TeamMemberCard';

const LandingPageContent = () => {
  const features = [
    {
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      title: 'Post New Ideas',
      description:
        'Easily submit your innovative ideas or feature requests to the board.',
    },
    {
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'Vote, Comment & Improve',
      description:
        'Engage with ideas by upvoting, leaving comments, and suggesting improvements.',
    },
    {
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      title: 'Track Trending Ideas',
      description:
        'Discover the most popular and implemented ideas within the community.',
    },
  ];

  const teamMembers = [
    { name: 'Apofus', guthub_uri: null },
    {
      name: '  Bożo (Coding Puppy)',
      guthub_uri: 'https://github.com/bstojkovic',
    },
    { name: 'Connor', guthub_uri: 'https://github.com/connororeil' },
    { name: 'Gift Ruwende', guthub_uri: 'https://github.com/willhitman' },
    { name: 'longlive247', guthub_uri: 'https://github.com/MarkoCuk54' },
    { name: 'Lore', guthub_uri: 'https://github.com/Lorevdh' },
    { name: 'Ola', guthub_uri: 'https://github.com/Vallayah' },
    { name: 'Krzysztof', guthub_uri: 'https://github.com/gikf' },
    { name: 'Sebastian_W', guthub_uri: 'https://github.com/Sebastian-Wlo' },
    { name: 'Tetris', guthub_uri: 'https://github.com/tetrisy' },
    { name: 'VooDooRe', guthub_uri: 'https://github.com/nurmukhammad03' },
  ];
  return (
    <>
      <section id='about-project-section' className='about-section'>
        <h2 className='about-heading-combined'>
          Project by the mint-syntax team:
        </h2>
        <div className='about-content'>
          <p className='about-project-description'>
            A collaborative brainstorming board where users can post new ideas
            or feature requests, upvote, comment on, and suggest improvements
            for ideas, and see trending or implemented ideas.
          </p>
          <div className='features-grid'>
            {features.map((feature, title) => (
              <FeatureCard
                key={title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
          <hr className='about-divider' />
          <h3 id='about-team-section' className='team-heading'>
            Team
          </h3>
          <div className='team-grid'>
            {teamMembers.map((member, guthub_uri) => (
              <TeamMemberCard
                key={guthub_uri}
                guthub_uri={member.guthub_uri}
                name={member.name}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPageContent;
