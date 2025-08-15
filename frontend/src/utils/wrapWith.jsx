export const wrapWith = (Element, Wrapper, elementProps = {}) => (
  <Wrapper>
    <Element {...elementProps} />
  </Wrapper>
);
