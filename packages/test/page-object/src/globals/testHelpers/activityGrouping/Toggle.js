import PropTypes from 'prop-types';

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

Toggle.defaultProps = {
  checked: false,
  children: undefined,
  disabled: false,
  type: 'checkbox'
};

Toggle.propTypes = {
  checked: PropTypes.bool,
  children: PropTypes.any,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string
};

export default Toggle;
