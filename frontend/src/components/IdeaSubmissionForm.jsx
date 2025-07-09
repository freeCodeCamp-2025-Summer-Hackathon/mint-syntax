import React from 'react';
import './../styles.css';

const IdeaSubmissionForm = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Idea submitted!');
  };

  return (
    <>
      <h2 className="idea-form-sub-heading">Submit Your New Idea</h2>
      <form className="idea-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="idea-title" className="form-label">Idea Title:</label>
          <input type="text" id="idea-title" name="idea-title" className="form-input" placeholder="e.g., Dark Mode for IdeaForge" required />
        </div>
        <div className="form-group">
          <label htmlFor="idea-description" className="form-label">Idea Description:</label>
          <textarea id="idea-description" name="idea-description" className="form-textarea" placeholder="Provide a detailed description of your idea, its benefits, and how it could be implemented." rows="6" required></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="idea-category" className="form-label">Category:</label>
          <select id="idea-category" name="idea-category" className="form-select">
            <option value="">Select a category</option>
            <option value="feature-request">Feature Request</option>
            <option value="bug-report">Bug Report</option>
            <option value="design-idea">Design Idea</option>
            <option value="general-feedback">General Feedback</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button type="submit" className="animated-button golden">
          Start Your IdeaForge
        </button>
      </form>
    </>
  );
};

export default IdeaSubmissionForm;