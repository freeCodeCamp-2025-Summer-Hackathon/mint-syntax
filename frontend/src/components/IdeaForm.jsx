import { Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';

import Spinny from './Spinny';
import { SuccessIcon } from './Icons/SuccessIcon';
import { useUser } from '../hooks/useUser';
import { SubmitButton } from './Buttons';
import { FormGroup } from './FormGroup';

export const IdeaForm = ({
  api,
  buttonText,
  disableSubmit,
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

  const isSubmitDisabled = useMemo(
    () => disableSubmit({ loading, success, isDirty, isLogged }),
    [disableSubmit, loading, success, isDirty, isLogged]
  );

  const fields = [
    {
      id: 'name',
      label: 'Idea Title',
      element: (
        <input
          {...register('name', { required: 'Idea Title is required' })}
          type='text'
          className='form-input'
          placeholder='e.g., Dark Mode for IdeaForge'
        />
      ),
    },
    {
      id: 'description',
      label: 'Idea Description',
      element: (
        <textarea
          {...register('description', {
            required: 'Idea Description is required',
          })}
          className='form-textarea'
          placeholder='Provide a detailed description of your idea, its benefits, and how it could be implemented.'
          rows='6'
        ></textarea>
      ),
    },
  ];

  return (
    <>
      <h2 className='idea-form-sub-heading'>{headerText}</h2>
      <form className='idea-form' onSubmit={handleSubmit(wrappedSubmit)}>
        {fields.map(({ id, label, element }) => (
          <Fragment key={id}>
            <FormGroup key={id} htmlFor={id} labelText={label} required={true}>
              {element}
            </FormGroup>
            {errors[id] && (
              <p role='alert' className='text-error'>
                {errors[id]?.message}
              </p>
            )}
          </Fragment>
        ))}
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
        <div className='flex justify-center'>
          <SubmitButton
            additionalClasses='!text-xl golden'
            disabled={isSubmitDisabled}
          >
            {success ? (
              <SuccessIcon />
            ) : loading ? (
              <Spinny />
            ) : (
              <>{buttonText}</>
            )}
          </SubmitButton>
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

export default IdeaForm;
