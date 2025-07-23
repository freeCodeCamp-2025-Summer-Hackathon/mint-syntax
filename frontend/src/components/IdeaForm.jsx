import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';

import Spinny from './Spinny';
import { useUser } from '../hooks/useUser';

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

export const IdeaForm = ({
  api,
  buttonText,
  disableButton,
  headerText,
  initialData,
  onSubmit,
}) => {
  const [submitError, setSubmitError] = useState();
  const { isLogged } = useUser();
  const [loading, setLoading] = useState();
  const [success, setSuccess] = useState();
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: {
      name: initialData?.name,
      description: initialData?.description,
    },
  });
  const { data, error } = api;
  const navigate = useNavigate();

  useEffect(() => {
    if (data && !error) {
      setSuccess(true);
      navigate(`/ideas/${data.id}`);
    }
    if (error) {
      setSubmitError(error.message);
      setLoading(false);
    }
  }, [data, navigate, error, setSubmitError]);

  const wrappedSubmit = async ideaData => {
    setLoading(true);
    await onSubmit(ideaData);
  };

  const buttonDisable = useMemo(
    () => disableButton({ loading, success, isDirty, isLogged }),
    [disableButton, loading, success, isDirty, isLogged]
  );

  return (
    <>
      <h2 className='idea-form-sub-heading'>{headerText}</h2>
      <form className='idea-form' onSubmit={handleSubmit(wrappedSubmit)}>
        <div className='form-group'>
          <label htmlFor='idea-title' className='form-label'>
            Idea Title: <span className='text-red-500'>*</span>
          </label>
          <input
            {...register('name', { required: 'Idea Title is required' })}
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
            Idea Description: <span className='text-red-500'>*</span>
          </label>
          <textarea
            {...register('description', {
              required: 'Idea Description is required',
            })}
            className='form-textarea'
            placeholder='Provide a detailed description of your idea, its benefits, and how it could be implemented.'
            rows='6'
            required
          ></textarea>
          {errors?.description && (
            <p role='alert' className='text-error'>
              {errors.description.message}
            </p>
          )}
        </div>
        {/* <div className='form-group'>
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
        <button
          type='submit'
          className='animated-button golden'
          {...(!!buttonDisable && { disabled: true })}
        >
          {success ? <SuccessIcon /> : loading ? <Spinny /> : <>{buttonText}</>}
        </button>
        {submitError && (
          <p role='alert' className='text-error'>
            Error: {submitError}
          </p>
        )}
      </form>
    </>
  );
};

export default IdeaForm;
