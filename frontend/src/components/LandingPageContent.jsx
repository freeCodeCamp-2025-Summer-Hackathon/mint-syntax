import React from 'react';
import './../styles.css';
import FeatureCard from './landingPageComponents/FeatureCard';
import TeamGrid from './landingPageComponents/TeamGrid';

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
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
          <hr className='about-divider' />
          <TeamGrid />
        </div>
      </section>
    </>
  );
};

export default LandingPageContent;
