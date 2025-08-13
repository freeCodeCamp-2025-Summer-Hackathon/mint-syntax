import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useForm } from 'react-hook-form';
import { PasswordIcon } from '../components/Icons/PasswordIcon';
import { UserIcon } from '../components/Icons/UserIcon';
import Spinny from '../components/Spinny';
import { SubmitButton } from '../components/Buttons';
import { FormGroup } from '../components/FormGroup';
import { ErrorElement } from '../components/Errors';

const MeEditPage = () => {
  const { isLoading, error, data, response, fetchFromApi, sendAsJson } = useApi(
    {
      loadingInitially: true,
    }
  );
  const [formSent, setFormSent] = useState(false);
  const [headerUserName, setHeaderUserName] = useState('');

  useEffect(() => {
    fetchFromApi(`/me`);
  }, [fetchFromApi]);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    getValues,
    setError,
  } = useForm();

  useEffect(() => {
    if (data?.name) {
      setHeaderUserName(data.name);
    }
    if (error) {
      console.log('Error:', error);
      if (response.status === 409) {
        setError('username', {
          type: 'unique',
          message: 'This username is already in use.',
        });
      } else if (response.status === 403) {
        setError('old_password', {
          type: 'validate',
          message: 'Old password is invalid',
        });
      }
    }
  }, [response, data, error, setError]);

  const onSubmit = async formData => {
    setFormSent(true);
    try {
      await sendAsJson(`/me`, formData, {
        method: 'PATCH',
      });
    } catch (e) {
      console.log('error!', e);
    }
  };

  const fields = [
    {
      id: 'name',
      label: 'Name',
      required: true,
      type: 'text',
      Icon: UserIcon,
      defaultValue: data?.name,
    },
    {
      id: 'new_password',
      label: 'New Password',
      type: 'password',
      Icon: PasswordIcon,
      options: {
        minLength: {
          value: 8,
          message: 'Passwords needs to be at least 8 characters long.',
        },
      },
    },
    {
      id: 'repeat_password',
      label: 'Repeat New Password',
      type: 'password',
      Icon: PasswordIcon,
      placeholder: 'Repeat Password',
      options: {
        validate: value =>
          getValues('new_password') === value ||
          'Both passwords need to match.',
      },
    },
    {
      id: 'old_password',
      label: 'Old Password (confirm password change)',
      type: 'password',
      placeholder: 'Old Password',
      Icon: PasswordIcon,
      options: {
        minLength: {
          value: 8,
          message: 'Passwords needs to be at least 8 characters long.',
        },
        required:
          !!getValues('new_password') &&
          'Old password needs to be provided when changing passwords.',
      },
    },
  ];

  return (
    <div className='section-card min-h-[60vh] flex flex-col items-center'>
      {isLoading ? (
        <Spinny />
      ) : (
        <>
          <h1 className='section-heading'>
            Edit {headerUserName}&apos;s Profile
          </h1>

          <form
            className='w-full max-w-xl p-4 bg-base-200 rounded-lg shadow-md'
            onSubmit={handleSubmit(onSubmit)}
          >
            {fields.map(
              ({
                id,
                label,
                type,
                Icon,
                required = false,
                placeholder = '',
                defaultValue = '',
                options = {},
              }) => (
                <FormGroup
                  key={id}
                  labelText={label}
                  htmlFor={id}
                  required={required}
                  errors={errors}
                >
                  <Icon />
                  <input
                    id={id}
                    {...register(id, {
                      ...(required && {
                        required: `The field "${label} is required`,
                      }),
                      ...options,
                    })}
                    type={type}
                    defaultValue={defaultValue}
                    placeholder={placeholder || label}
                    className='input-validator'
                    aria-invalid={!!errors[id]}
                  />
                </FormGroup>
              )
            )}

            {error && response.status !== 403 && (
              <ErrorElement Element='div' center>
                Something went wrong, please try again later.
              </ErrorElement>
            )}

            {response.status === 200 && formSent && (
              <div className='text-info text-center'>Changes applied!</div>
            )}

            <div className='flex justify-center gap-4 mt-6'>
              <Link
                to={`/me`}
                className='animated-button !text-base !px-5 !py-2 !bg-gray-500 hover:!bg-gray-600'
              >
                Back to Profile
              </Link>
              <SubmitButton
                additionalClasses='!bg-gray-500 hover:!bg-gray-600'
                disabled={isSubmitting}
              >
                Save Changes
              </SubmitButton>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default MeEditPage;
