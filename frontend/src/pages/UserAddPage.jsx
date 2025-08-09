import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '../hooks/useUser';
import { useApi } from '../hooks/useApi';
import Spinny from '../components/Spinny';
import { SubmitButton } from '../components/Buttons';
import { FormGroup } from '../components/FormGroup';
import { DisplayIfError, ErrorElement } from '../components/Errors';

const UserAddPage = () => {
  const navigate = useNavigate();
  const { isLogged, isAdmin } = useUser();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isNewAdmin, setIsNewAdmin] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data, isLoading, response, sendFormData } = useApi({
    method: 'POST',
  });

  useEffect(() => {
    if (!isLogged) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/');
    }
  }, [isLogged, isAdmin, navigate]);

  useEffect(() => {
    if (response && data) {
      if (response.ok) {
        setMessage('User created successfully!');
        setError(null);
        setUsername('');
        setName('');
        setPassword('');
        setRepeatPassword('');
        setIsNewAdmin(false);
        setTimeout(() => navigate('/users'), 2000);
      } else {
        setError({ message: data.message || 'Failed to create user.' });
        setMessage('');
      }
    }
  }, [data, navigate, response]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setMessage('');

    if (password !== repeatPassword) {
      setError({ message: 'Passwords do not match.' });
      return;
    }

    if (!username || !name || !password) {
      setError({ message: 'Please fill in all required fields.' });
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('name', name);
    formData.append('password', password);
    formData.append('is_admin', isNewAdmin);

    await sendFormData('/users/add', { formData });
  };

  if (isLoading) {
    return <Spinny />;
  }

  if (!isAdmin) {
    return (
      <div className='section-card flex flex-col items-center justify-center min-h-[60vh]'>
        <ErrorElement Element='h1' className='section-heading'>
          Access Denied
        </ErrorElement>
        <p className='text-lg text-gray-600 mb-8'>
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  const fields = [
    {
      id: 'username',
      label: 'Username',
      type: 'text',
      value: username,
      onChange: setUsername,
      required: true,
    },
    {
      id: 'name',
      label: 'Name',
      type: 'text',
      value: name,
      onChange: setName,
      required: true,
    },
    {
      id: 'password',
      label: 'Password',
      type: 'password',
      value: password,
      onChange: setPassword,
      required: true,
    },
    {
      id: 'repeatpassword',
      label: 'Repeat Password',
      type: 'password',
      value: repeatPassword,
      onChange: setRepeatPassword,
      required: true,
    },
  ];

  return (
    <div className='section-card flex flex-col items-center min-h-[60vh]'>
      <h1 className='section-heading'>Add New User</h1>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-md p-4 bg-base-200 rounded-lg shadow-md'
      >
        <DisplayIfError error={error} center additionalClasses='mb-4' />
        {message && <p className='text-success text-center mb-4'>{message}</p>}

        {fields.map(
          ({ id, label, type, onChange, value, required = false }) => (
            <FormGroup
              key={id}
              htmlFor={id}
              labelText={label}
              required={required}
            >
              <input
                type={type}
                id={id}
                className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300 bg-white text-gray-800'
                value={value}
                onChange={e => onChange(e.target.value)}
                required={required}
              />
            </FormGroup>
          )
        )}

        <FormGroup htmlFor='is_admin' labelText='Admin Status'>
          <div className='flex gap-4'>
            {[
              {
                label: 'User',
                value: 'false',
                checked: !isNewAdmin,
                onChange: () => setIsNewAdmin(false),
              },
              {
                label: 'Admin',
                value: 'true',
                checked: isNewAdmin,
                onChange: () => setIsNewAdmin(true),
              },
            ].map(({ label, value, checked, onChange }) => (
              <label className='flex items-center' key={label}>
                <input
                  type='radio'
                  name='is_admin'
                  value={value}
                  checked={checked}
                  onChange={onChange}
                  className='radio radio-primary'
                />
                <span className='ml-2 text-lg'>{label}</span>
              </label>
            ))}
          </div>
        </FormGroup>

        <SubmitButton
          additionalClasses='mt-4 !text-base !px-5 !py-2'
          disabled={isLoading}
        >
          {isLoading ? 'Adding User...' : 'Add User'}
        </SubmitButton>
      </form>
    </div>
  );
};

export default UserAddPage;
