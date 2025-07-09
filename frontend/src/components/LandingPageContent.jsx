import React from 'react';
import './../styles.css';

const LandingPageContent = () => {
  return (
    <>
      <section id="about-project-section" className="about-section">
        <h2 className="about-heading-combined">Project by the mint-syntax team:</h2>
        <div className="about-content">
          <p className="about-project-description">
            A collaborative brainstorming board where users can post new ideas or feature requests, upvote, comment on,
            and suggest improvements for ideas, and see trending or implemented ideas.
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <svg className="feature-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                </path>
              </svg>
              <h3 className="feature-title">Post New Ideas</h3>
              <p className="feature-description">Easily submit your innovative ideas or feature requests to the board.</p>
            </div>
            <div className="feature-card">
              <svg className="feature-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="feature-title">Vote, Comment & Improve</h3>
              <p className="feature-description">Engage with ideas by upvoting, leaving comments, and suggesting
                improvements.</p>
            </div>
            <div className="feature-card">
              <svg className="feature-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              <h3 className="feature-title">Track Trending Ideas</h3>
              <p className="feature-description">Discover the most popular and implemented ideas within the community.</p>
            </div>
          </div>
          <hr className="about-divider" />

          <h3 id="about-team-section" className="team-heading">Team</h3>
          <div className="team-grid">
            <span className="team-member">Apofus</span>
            <span className="team-member"><a href="https://github.com/bstojkovic" className="team-link" target="_blank" rel="noopener noreferrer">Bożo
              (Coding Puppy)</a></span>
            <span className="team-member"><a href="https://github.com/connororeil" className="team-link" target="_blank" rel="noopener noreferrer">Connor</a></span>
            <span className="team-member"><a href="https://github.com/willhitman" className="team-link" target="_blank" rel="noopener noreferrer">Gift
              Ruwende</a></span>
            <span className="team-member"><a href="https://github.com/MarkoCuk54" className="team-link" target="_blank" rel="noopener noreferrer">longlive247</a></span>
            <span className="team-member"><a href="https://github.com/Lorevdh" className="team-link" target="_blank" rel="noopener noreferrer">Lore</a></span>
            <span className="team-member">Millicent</span>
            <span className="team-member"><a href="https://github.com/Vallayah" className="team-link" target="_blank" rel="noopener noreferrer">Ola</a></span>
            <span className="team-member"><a href="https://github.com/gikf" className="team-link" target="_blank" rel="noopener noreferrer">Krzysztof</a></span>
            <span className="team-member"><a href="https://github.com/Sebastian-Wlo" className="team-link" target="_blank" rel="noopener noreferrer">Sebastian_W</a></span>
            <span className="team-member"><a href="https://github.com/tetrisy" className="team-link" target="_blank" rel="noopener noreferrer">Tetris</a></span>
            <span className="team-member"><a href="https://github.com/nurmukhammad03" className="team-link" target="_blank" rel="noopener noreferrer">VooDooRe</a></span>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPageContent;