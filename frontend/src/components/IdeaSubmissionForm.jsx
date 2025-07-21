import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import Spinny from './Spinny';

const IdeaSubmissionForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { isLoading, error, data, fetchFromApi } = useApi({ method: 'POST' });

  const handleSubmit = async event => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await fetchFromApi('/ideas', {
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, description, category }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (data && !error) {
      setSuccessMessage('Idea submitted successfully!');
      setName('');
      setDescription('');
      setCategory('');
    }
    if (error) {
      setErrorMessage(`Error: ${error.message || 'Something went wrong'}`);
    }
  }, [data, error]);

  return (
    <section className='idea-form-section'>
      <div className='section-card' tabIndex='0'>
        <h3 className='section-heading'>Submit Your Idea</h3>
        <form onSubmit={handleSubmit} className='idea-form'>
          <div className='form-group'>
            <label htmlFor='ideaName' className='form-label'>
              Idea Name <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              id='ideaName'
              className='form-input'
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='description' className='form-label'>
              Description <span className='text-red-500'>*</span>
            </label>
            <textarea
              id='description'
              className='form-textarea'
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className='form-group'>
            <label htmlFor='category' className='form-label'>
              Category <span className='text-red-500'>*</span>
            </label>
            <select
              id='category'
              className='form-select'
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value=''>Select a category</option>
              <option value='feature'>Feature Request</option>
              <option value='bug'>Bug Report</option>
              <option value='improvement'>Improvement</option>
              <option value='other'>Other</option>
            </select>
          </div>
          <button
            type='submit'
            className='animated-button'
            disabled={isLoading}
          >
            {isLoading ? <Spinny /> : 'Submit Idea'}
          </button>
        </form>
        {successMessage && (
          <p className='text-green-600 mt-4'>{successMessage}</p>
        )}
        {errorMessage && <p className='text-red-600 mt-4'>{errorMessage}</p>}
      </div>
    </section>
  );
};

export default IdeaSubmissionForm;
