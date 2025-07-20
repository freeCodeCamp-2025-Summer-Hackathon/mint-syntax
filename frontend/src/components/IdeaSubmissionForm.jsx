import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import Spinny from './Spinny';

const SuccessIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-6 w-6 shrink-0 stroke-current'
    fill='none'
    viewBox='0 0 24 24'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    />
  </svg>
);

const IdeaSubmissionForm = () => {
  const { isLogged } = useUser();
  const [submitError, setSubmitError] = useState();
  const [loading, setLoading] = useState();
  const [success, setSuccess] = useState();
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm();
  const { data, error, fetchFromApi } = useApi({ method: 'POST' });
  const navigate = useNavigate();

  useEffect(() => {
    if (data && !error) {
      setSuccess(true);
      navigate(`/idea/${data.id}`);
    }
    if (error) {
      setSubmitError(error.message);
      setLoading(false);
    }
  }, [data, navigate, error, setSubmitError]);

  const onSubmit = async ideaData => {
    setLoading(true);
    if (!isLogged) {
      setSubmitError('Please login to submit ideas');
      setLoading(false);
      return;
    }
    try {
      await fetchFromApi(`/ideas`, {
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(ideaData),
      });
    } catch (e) {
      console.error('error', e);
    }
  };

  return (
    <>
      <h2 className='idea-form-sub-heading'>Submit Your New Idea</h2>
      <form className='idea-form' onSubmit={handleSubmit(onSubmit)}>
        <div className='form-group'>
          <label htmlFor='idea-title' className='form-label'>
            Idea Title:
          </label>
          <input
            {...register('name')}
            type='text'
            className='form-input'
            placeholder='e.g., Dark Mode for IdeaForge'
            required
          />
          {errors?.name && (
            <p role='alert' className='text-error'>
              {errors.name.message}
            </p>
          )}
        </div>
        <div className='form-group'>
          <label htmlFor='idea-description' className='form-label'>
            Idea Description:
          </label>
          <textarea
            {...register('description')}
            className='form-textarea'
            placeholder='Provide a detailed description of your idea, its benefits, and how it could be implemented.'
            rows='6'
          ></textarea>
          {errors?.description && (
            <p role='alert' className='text-error'>
              {errors.description.message}
            </p>
          )}
        </div>
        {/*         <div className='form-group'>
          <label htmlFor='idea-category' className='form-label'>
            Category:
          </label>
          <select
            id='idea-category'
            name='idea-category'
            className='form-select'
          >
            <option value=''>Select a category</option>
            <option value='feature-request'>Feature Request</option>
            <option value='bug-report'>Bug Report</option>
            <option value='design-idea'>Design Idea</option>
            <option value='general-feedback'>General Feedback</option>
            <option value='other'>Other</option>
          </select>
        </div> */}
        <div
          style={{ width: 'fit-content', alignSelf: 'center' }}
          {...(!isLogged && {
            className: 'tooltip tooltip-warning',
            'data-tip': 'Login to add ideas',
          })}
        >
          <button
            type='submit'
            className='animated-button golden'
            {...((loading || success || !isLogged) && { disabled: true })}
          >
            {success ? (
              <SuccessIcon />
            ) : loading ? (
              <Spinny />
            ) : (
              <>Start Your IdeaForge</>
            )}
          </button>
        </div>
        {submitError && (
          <p role='alert' className='text-error'>
            Error: {submitError}
          </p>
        )}
      </form>
    </>
  );
};

export default IdeaSubmissionForm;
