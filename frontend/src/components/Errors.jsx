export const ErrorElement = ({
  Element = 'p',
  center = false,
  additionalClasses = '',
  children,
  ...props
}) => {
  const className = [
    'text-error',
    ...(center ? ['text-center'] : []),
    ...additionalClasses.split(' '),
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Element role='alert' className={className} {...props}>
      {children}
    </Element>
  );
};

export const DisplayIfError = ({ field, errors, error, ...props }) => {
  const errorForField = error ?? errors?.[field];

  return (
    errorForField && (
      <ErrorElement {...props}>{errorForField?.message}</ErrorElement>
    )
  );
};

export default DisplayIfError;
