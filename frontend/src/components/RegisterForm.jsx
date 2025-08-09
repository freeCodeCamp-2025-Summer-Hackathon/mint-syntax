import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { PasswordIcon } from './Icons/PasswordIcon';
import { UserIcon } from './Icons/UserIcon';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import { SubmitButton } from './Buttons';
import { FormGroup } from './FormGroup';
import { ErrorElement } from './Errors';

export function RegisterForm({ redirect_to = '/' }) {
  const formRef = useRef();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    getValues,
    setError,
  } = useForm({ mode: 'onTouched' });

  const { isLogged } = useUser();
  const navigate = useNavigate();

  const { error, response, data, sendFormData } = useApi({ method: 'POST' });

  useEffect(() => {
    if (data && !error) {
      navigate('/login');
    }
    if (error) {
      console.log('Error:', error);
      if (response.status === 409) {
        setError('username', {
          type: 'unique',
          message: 'This username is already in use.',
        });
      }
    }
  }, [response, data, error, navigate, setError]);

  useEffect(() => {
    if (isLogged && redirect_to) {
      navigate(redirect_to);
    }
  }, [isLogged, navigate, redirect_to]);

  const onSubmit = async () => {
    try {
      await sendFormData('/users', { formRef });
    } catch (e) {
      console.log('error!', e);
    }
  };

  const fields = [
    {
      id: 'username',
      label: 'Username',
      type: 'text',
      Icon: UserIcon,
    },
    {
      id: 'name',
      label: 'Name',
      type: 'text',
      Icon: UserIcon,
    },
    {
      id: 'password',
      label: 'Password',
      type: 'password',
      Icon: PasswordIcon,
      options: {
        minLength: {
          value: 8,
          message: 'The password needs to be at least 8 characters long.',
        },
      },
    },
    {
      id: 'repeatPassword',
      label: 'Repeat Password',
      placeholder: 'Password',
      type: 'password',
      Icon: PasswordIcon,
      options: {
        validate: {
          matches: value =>
            getValues('password') === value || 'Both passwords need to match',
        },
      },
    },
  ];

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className='w-full max-w-md p-4 bg-white'
    >
      {fields.map(
        ({ id, label, type, Icon, placeholder = '', options = {} }) => (
          <FormGroup
            key={id}
            htmlFor={id}
            labelText={label}
            required={true}
            errors={errors}
            errorProps={{ additionalClasses: 'text-xs mt-0.5' }}
          >
            <Icon />
            <input
              id={id}
              {...register(id, {
                required: `The field "${label}" is required.`,

                ...options,
              })}
              type={type}
              placeholder={placeholder || label}
              className='input-validator'
              aria-invalid={!!errors[id]}
            />
          </FormGroup>
        )
      )}

      {error && response.status !== 409 && (
        <ErrorElement Element='div' additionalClasses='text-xs mt-0.5' center>
          Something went wrong, please try again later.
        </ErrorElement>
      )}

      <div className='flex justify-center'>
        <SubmitButton disabled={isSubmitting}>Register</SubmitButton>
      </div>
    </form>
  );
}

export default RegisterForm;
