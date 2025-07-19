export function DevOnly({ children }) {
  if (import.meta.env.DEV) {
    return <>{children}</>;
  }
  return null;
}
