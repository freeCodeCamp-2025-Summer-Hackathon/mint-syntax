import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router';
import { UserIcon } from './Icons/UserIcon';
import { PasswordIcon } from './Icons/PasswordIcon';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import { SubmitButton } from './Buttons';
import { FormGroup } from './FormGroup';
import { DisplayIfError, ErrorElement } from './Errors';

export function LoginForm({ redirect_to = '/', dialogRef }) {
  const formRef = useRef();
  const {
    formState: { errors, isSubmitting, isValid },
    handleSubmit,
    register,
    setError,
  } = useForm();
  const { isLogged, login } = useUser();
  const navigate = useNavigate();
  const { error, response, data, sendFormData } = useApi({ method: 'POST' });

  useEffect(() => {
    if (isLogged && redirect_to) {
      navigate(redirect_to);
    }
  }, [isLogged, navigate, redirect_to]);

  useEffect(() => {
    if (data && !error) {
      login(data);
    }
    if (error && response && data) {
      if (response?.status === 401) {
        setError('root.responseError', { type: 401, message: data?.detail });
      }
    }
  }, [data, error, login, response, setError]);

  const onSubmit = async () => {
    try {
      await sendFormData('/auth', { formRef });
    } catch (e) {
      console.error(e);
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
      id: 'password',
      label: 'Password',
      type: 'password',
      Icon: PasswordIcon,
    },
  ];

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
        {fields.map(({ id, label, type, Icon }) => (
          <FormGroup
            key={id}
            htmlFor={id}
            labelText={label}
            required={true}
            errors={errors}
          >
            <Icon />
            <input
              id={id}
              {...register(id, {
                required: `The field "${label}" is required.`,
              })}
              type={type}
              placeholder={label}
              className='input-validator'
              aria-invalid={!!errors[id]}
            />
          </FormGroup>
        ))}

        <DisplayIfError error={errors?.root?.responseError} center />
        {error && !errors.root?.responseError && (
          <ErrorElement center>Error, try again later.</ErrorElement>
        )}

        <div className='flex justify-center'>
          <SubmitButton disabled={isSubmitting || !isValid}>
            {isSubmitting && <span className='loading loading-spinner'></span>}
            Login
          </SubmitButton>
        </div>
      </form>

      {/* 🔐 Forgot password link */}
      <div className='text-center mt-4'>
        <Link
          to='/forgot-password'
          className='link link-hover'
          {...(dialogRef && {
            onClick: () => {
              dialogRef.current.close();
            },
          })}
        >
          Forgot your password?
        </Link>
      </div>
    </>
  );
}

export default LoginForm;
