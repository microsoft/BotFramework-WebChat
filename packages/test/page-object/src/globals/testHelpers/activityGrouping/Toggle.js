// Use React from window (UMD) instead of import.
const { React: { useCallback, useMemo } = {} } = window;

const Toggle = ({ checked, children, disabled, onChange, type }) => {
  const handleChange = useCallback(({ target: { checked } }) => onChange(checked), [onChange]);
  const style = useMemo(() => ({ userSelect: 'none' }), []);

  return (
    <label style={style}>
      <input checked={checked} disabled={disabled} onChange={handleChange} type={type || 'checkbox'} />
      {children}
    </label>
  );
};

export default Toggle;
