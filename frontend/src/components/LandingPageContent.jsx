import FeatureCard from './FeatureCard';
import TeamMemberCard from './TeamMemberCard';
import { CreateNewIcon } from './Icons/CreateNewIcon';
import { EngagingIcon } from './Icons/EngagingIcon';
import { TrendingIcon } from './Icons/TrendingIcon';

const LandingPageContent = () => {
  const features = [
    {
      Icon: CreateNewIcon,
      title: 'Post New Ideas',
      description:
        'Easily submit your innovative ideas or feature requests to the board.',
    },
    {
      Icon: EngagingIcon,
      title: 'Vote, Comment & Improve',
      description:
        'Engage with ideas by upvoting, leaving comments, and suggesting improvements.',
    },
    {
      Icon: TrendingIcon,
      title: 'Track Trending Ideas',
      description:
        'Discover the most popular and implemented ideas within the community.',
    },
  ];

  const teamMembers = [
    // { name: 'Apofus' },
    {
      name: '  Bożo (Coding Puppy)',
      github_uri: 'https://github.com/bstojkovic',
    },
    { name: 'Connor', github_uri: 'https://github.com/connororeil' },
    { name: 'Gift Ruwende', github_uri: 'https://github.com/willhitman' },
    // { name: 'longlive247', github_uri: 'https://github.com/MarkoCuk54' },
    { name: 'Lore', github_uri: 'https://github.com/Lorevdh' },
    { name: 'Ola', github_uri: 'https://github.com/Vallayah' },
    { name: 'Krzysztof', github_uri: 'https://github.com/gikf' },
    { name: 'Sebastian_W', github_uri: 'https://github.com/Sebastian-Wlo' },
    { name: 'Theo', github_uri: 'https://github.com/cosmonewt' },
    // { name: 'Tetris', github_uri: 'https://github.com/tetrisy' },
    // { name: 'VooDooRe', github_uri: 'https://github.com/nurmukhammad03' },
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
            {features.map(({ title, description, Icon }) => (
              <FeatureCard
                key={title}
                title={title}
                Icon={Icon}
                description={description}
              ></FeatureCard>
            ))}
          </div>
          <hr className='about-divider' />
          <h3 id='about-team-section' className='team-heading'>
            Team
          </h3>
          <div className='team-grid'>
            {teamMembers.map(member => (
              <TeamMemberCard
                key={member.name}
                github_uri={member.github_uri}
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
