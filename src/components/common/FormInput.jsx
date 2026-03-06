import React, { useId } from 'react';
import PropTypes from 'prop-types';

export const Input = ({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  error = '',
  disabled = false,
  required = false,
  className = '',
  id: idProp,
  ...rest
}) => {
  const generatedId = useId();
  const id = idProp || generatedId;
  const errorId = `${id}-error`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger-400" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-required={required || undefined}
        className={`form-input ${error ? 'border-danger-500' : ''} ${className}`}
        {...rest}
      />
      {error && (
        <div id={errorId} className="form-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export const Textarea = ({
  label,
  placeholder = '',
  value,
  onChange,
  onBlur,
  error = '',
  disabled = false,
  required = false,
  rows = 4,
  className = '',
  id: idProp,
  ...rest
}) => {
  const generatedId = useId();
  const id = idProp || generatedId;
  const errorId = `${id}-error`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger-400" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        rows={rows}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`form-input resize-none ${error ? 'border-danger-500' : ''} ${className}`}
        {...rest}
      />
      {error && (
        <div id={errorId} className="form-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
};

Textarea.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  rows: PropTypes.number,
  className: PropTypes.string,
};

export const Select = ({
  label,
  options = [],
  value,
  onChange,
  error = '',
  disabled = false,
  required = false,
  className = '',
  id: idProp,
  ...rest
}) => {
  const generatedId = useId();
  const id = idProp || generatedId;
  const errorId = `${id}-error`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger-400" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`form-input ${error ? 'border-danger-500' : ''} ${className}`}
        {...rest}
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div id={errorId} className="form-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
};

Select.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export const Checkbox = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  className = '',
  ...rest
}) => {
  return (
    <label className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 rounded border-dark-600 text-primary-600 focus:ring-primary-500"
        {...rest}
      />
      {label && <span className="ml-2 text-sm text-dark-100">{label}</span>}
    </label>
  );
};

Checkbox.propTypes = {
  label: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;
