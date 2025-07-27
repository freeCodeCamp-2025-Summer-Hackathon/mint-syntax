import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '../hooks/useUser';
import { useApi } from '../hooks/useApi';
import Spinny from '../components/Spinny';

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

  const { data, isLoading, response, fetchFromApi } = useApi({
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
        setError('');
        setUsername('');
        setName('');
        setPassword('');
        setRepeatPassword('');
        setIsNewAdmin(false);
        // Redirect to users list after a 2s is enough time to show the message I guess?
        setTimeout(() => navigate('/users'), 2000);
      } else {
        setError(data.message || 'Failed to create user.');
        setMessage('');
      }
    }
  }, [data, navigate, response]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== repeatPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!username || !name || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('name', name);
    formData.append('password', password);
    formData.append('is_admin', isNewAdmin);

    await fetchFromApi('/users/add', { body: formData});
  };

  if (isLoading) {
    return <Spinny />;
  }

  if (!isAdmin) {
    return (
      <div className='section-card flex flex-col items-center justify-center min-h-[60vh]'>
        <h1 className='section-heading text-error'>Access Denied</h1>
        <p className='text-lg text-gray-600 mb-8'>
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className='section-card flex flex-col items-center min-h-[60vh]'>
      <h1 className='section-heading'>Add New User</h1>
      <form onSubmit={handleSubmit} className='idea-form'>
        {error && <p className='text-error text-center mb-4'>{error}</p>}
        {message && <p className='text-success text-center mb-4'>{message}</p>}

        <div className='form-group'>
          <label htmlFor='username' className='form-label'>
            Username:
          </label>
          <input
            type='text'
            id='username'
            className='form-input'
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='name' className='form-label'>
            Name:
          </label>
          <input
            type='text'
            id='name'
            className='form-input'
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='password' className='form-label'>
            Password:
          </label>
          <input
            type='password'
            id='password'
            className='form-input'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='repeatPassword' className='form-label'>
            Repeat Password:
          </label>
          <input
            type='password'
            id='repeatPassword'
            className='form-input'
            value={repeatPassword}
            onChange={e => setRepeatPassword(e.target.value)}
            required
          />
        </div>

        {isAdmin && (
          <div className='form-group'>
            <label className='form-label'>User Role:</label>
            <div className='flex gap-4'>
              <label className='flex items-center'>
                <input
                  type='radio'
                  name='userRole'
                  value='user'
                  checked={!isNewAdmin}
                  onChange={() => setIsNewAdmin(false)}
                  className='radio radio-primary'
                />
                <span className='ml-2 text-lg'>User</span>
              </label>
              <label className='flex items-center'>
                <input
                  type='radio'
                  name='userRole'
                  value='admin'
                  checked={isNewAdmin}
                  onChange={() => setIsNewAdmin(true)}
                  className='radio radio-primary'
                />
                <span className='ml-2 text-lg'>Admin</span>
              </label>
            </div>
          </div>
        )}

        <button
          type='submit'
          className='animated-button mt-4'
          disabled={isLoading}
        >
          {isLoading ? 'Adding User...' : 'Add User'}
        </button>
      </form>
    </div>
  );
};

export default UserAddPage;
