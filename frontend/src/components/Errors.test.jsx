import { expect, test, describe } from 'vitest';
import { render } from 'vitest-browser-react';
import { DisplayIfError, ErrorElement } from './Errors';

describe('Errors.jsx', async () => {
  describe('ErrorElement', async () => {
    test('has correct text', async () => {
      const { getByRole } = render(<ErrorElement>Error text</ErrorElement>);
      expect(getByRole('alert')).toHaveTextContent(/^Error text$/);
    });

    test('has correct different text', async () => {
      const { getByRole } = render(
        <ErrorElement>Different message</ErrorElement>
      );
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent(/^Different message$/);
      expect(alert).not.toHaveTextContent('Error text');
    });

    test('has center class with center prop', async () => {
      const { getByRole } = render(
        <ErrorElement center>Error text</ErrorElement>
      );

      expect(getByRole('alert')).toHaveClass('text-center');
    });

    test('has no center class without center prop', async () => {
      const { getByRole } = render(<ErrorElement>Error text</ErrorElement>);

      expect(getByRole('alert')).not.toHaveClass('text-center');
    });
  });

  describe('DisplayIfError', async () => {
    test('renders alert on error', async () => {
      const { getByRole } = render(
        <DisplayIfError error={{ message: 'Error text' }} />
      );

      const element = getByRole('alert');
      expect(element).toBeVisible();
      expect(element).toHaveTextContent(/^Error text$/);
    });

    test('renders alert with message for described field', async () => {
      const errors = {
        field1: { message: 'wrong error' },
        field2: { message: 'Correct message' },
      };

      const { getByRole, getByText } = render(
        <DisplayIfError errors={errors} field='field2' />
      );

      const element = getByRole('alert');
      expect(element).toBeVisible();
      expect(element).toHaveTextContent(/^Correct message$/);
      await expect
        .poll(() => getByText('wrong error').query())
        .not.toBeInTheDocument();
    });

    test("doesn't render alert when field doesn't have message", async () => {
      const errors = {
        field1: { message: 'wrong error' },
      };

      const { getByRole } = render(
        <DisplayIfError errors={errors} field='field2' />
      );

      await expect
        .poll(() => getByRole('alert').query())
        .not.toBeInTheDocument();
    });

    test('renders alert when error has message', async () => {
      const { getByRole, getByText } = render(
        <DisplayIfError
          error={{ message: 'Error message', notMessage: 'wrong error' }}
        />
      );

      const element = getByRole('alert');
      expect(element).toBeVisible();
      expect(element).toHaveTextContent(/^Error message$/);
      await expect
        .poll(() => getByText('wrong error').query())
        .not.toBeInTheDocument();
    });

    test("doesn't render alert when error is null", async () => {
      const { getByRole } = render(<DisplayIfError error={null} />);

      await expect
        .poll(() => getByRole('alert').query())
        .not.toBeInTheDocument();
    });
  });
});
