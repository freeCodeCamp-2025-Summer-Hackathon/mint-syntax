const Button = ({ type, disabled, additionalClasses, children, ...props }) => {
  const className =
    'animated-button !text-base !px-5 !py-2' +
    (additionalClasses ? ' ' + additionalClasses : '');
  return (
    <button
      type={type}
      className={className}
      {...(disabled && { disabled: true })}
      {...props}
    >
      {children}
    </button>
  );
};

export const SubmitButton = ({ children, ...props }) => (
  <Button type='submit' {...props}>
    {children}
  </Button>
);

export const ActionButton = ({ children, ...props }) => (
  <Button type='button' {...props}>
    {children}
  </Button>
);
