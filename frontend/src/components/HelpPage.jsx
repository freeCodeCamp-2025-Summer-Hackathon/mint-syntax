import React from 'react';
import './../styles.css';

const HelpPage = () => {
  return (
    <section className='help-page-section'>
      <h2 className='help-page-heading'>Need Help?</h2>
      <p className='help-page-intro'>
        Welcome to the IdeaForge Help Center. Find answers to common questions
        below.
      </p>

      <div className='faq-section'>
        <h3>Frequently Asked Questions</h3>
        <div className='faq-item'>
          <h4>How do I post a new idea?</h4>
          <p>
            Navigate to the "Post Idea" section, fill in the title, description,
            and category, then click "Submit".
          </p>
        </div>
        <div className='faq-item'>
          <h4>How can I vote on an idea?</h4>
          <p>
            Find the idea in the "Vote on Current Ideas" list and click the
            upvote icon next to it.
          </p>
        </div>
        <div className='faq-item'>
          <h4>Can I edit my idea after posting?</h4>
          <p>
            Currently, ideas cannot be edited after submission. Please
            double-check before posting!
          </p>
        </div>
      </div>

      <div className='contact-section'>
        <h3>Still have questions?</h3>
        <p>
          If you can't find what you're looking for, please reach out to our
          support team:
        </p>
        <p>
          Email:{' '}
          <a href='mailto:support@ideaforge.com' className='help-link'>
            support@ideaforge.com
          </a>
        </p>
        <p>
          <a href='#' className='animated-button help-button'>
            Contact Support
          </a>
        </p>
      </div>
    </section>
  );
};

export default HelpPage;
