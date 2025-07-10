import React from 'react';
import './../styles.css';

const IdeaFormSection = () => {
  return (
    <section className='idea-form-section'>
      <div className='voting-section' tabIndex='0'>
        <h3>Vote on Current Ideas</h3>
        <ul className='idea-list'>
          <li className='idea-item'>
            <span className='idea-text'>Add a dark mode to the interface</span>
            <div className='vote-controls'>
              <button className='image-only-upvote-button'>
                <img
                  src='https://i.ibb.co/DfxLPp7g/Upvote-transparent-2.png'
                  alt='Upvote'
                  className='upvote-icon'
                />
              </button>
              <span className='vote-count'>120</span>
            </div>
          </li>
          <li className='idea-item'>
            <span className='idea-text'>Implement real-time collaboration</span>
            <div className='vote-controls'>
              <button className='image-only-upvote-button'>
                <img
                  src='https://i.ibb.co/DfxLPp7g/Upvote-transparent-2.png'
                  alt='Upvote'
                  className='upvote-icon'
                />
              </button>
              <span className='vote-count'>95</span>
            </div>
          </li>
          <li className='idea-item'>
            <span className='idea-text'>
              Integrate with Slack for notifications
            </span>
            <div className='vote-controls'>
              <button className='image-only-upvote-button'>
                <img
                  src='https://i.ibb.co/DfxLPp7g/Upvote-transparent-2.png'
                  alt='Upvote'
                  className='upvote-icon'
                />
              </button>
              <span className='vote-count'>78</span>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default IdeaFormSection; //
