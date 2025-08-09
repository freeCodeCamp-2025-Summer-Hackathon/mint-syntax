import { DisplayIfError } from './Errors';

export const FormGroup = ({
  labelText,
  htmlFor,
  required = false,
  errors = null,
  errorProps = {},
  children,
}) => {
  return (
    <div className='form-group'>
      <label htmlFor={htmlFor} className='form-label'>
        {labelText}: {required && <span className='text-red-500'>*</span>}
      </label>
      {children?.props?.className ? (
        children
      ) : (
        <label className='input input-sm'>{children}</label>
      )}
      <DisplayIfError field={htmlFor} errors={errors} {...errorProps} />
    </div>
  );
};
