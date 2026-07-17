import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { VALIDATION } from '@/config/constants';

export type ValidationRule<T> = (value: T) => string | null;

export interface FieldConfig<T> {
  initialValue: T;
  validate?: ValidationRule<T>;
  required?: boolean;
}

export type FormConfig<T> = {
  [K in keyof T]: FieldConfig<T[K]>;
};

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
}

export function useForm<T extends Record<string, any>>(
  config: FormConfig<T>
) {
  const initialValues = Object.entries(config).reduce(
    (acc, [key, field]) => ({
      ...acc,
      [key]: field.initialValue,
    }),
    {}
  ) as T;

  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isDirty: false,
  });

  const validateField = useCallback(
    (name: keyof T, value: any): string | null => {
      const fieldConfig = config[name];

      if (fieldConfig.required && !value) {
        return `${String(name)} is required`;
      }

      if (fieldConfig.validate) {
        return fieldConfig.validate(value);
      }

      return null;
    },
    [config]
  );

  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(config).forEach((key) => {
      const error = validateField(key as keyof T, formState.values[key as keyof T]);
      if (error) {
        errors[key as keyof T] = error;
        isValid = false;
      }
    });

    setFormState((prev) => ({
      ...prev,
      errors,
      isValid,
    }));

    return isValid;
  }, [config, formState.values, validateField]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = event.target;
      const newValue = type === 'checkbox' ? (event.target as HTMLInputElement).checked : value;

      setFormState((prev) => ({
        ...prev,
        values: { ...prev.values, [name]: newValue },
        touched: { ...prev.touched, [name]: true },
        isDirty: true,
      }));

      const error = validateField(name as keyof T, newValue);
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: error },
      }));
    },
    [validateField]
  );

  const handleBlur = useCallback(
    (name: keyof T) => {
      setFormState((prev) => ({
        ...prev,
        touched: { ...prev.touched, [name]: true },
      }));

      const error = validateField(name, formState.values[name]);
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: error },
      }));
    },
    [formState.values, validateField]
  );

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void) => async (event: FormEvent) => {
      event.preventDefault();

      // Mark all fields as touched
      const touchedFields = Object.keys(config).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );

      setFormState((prev) => ({
        ...prev,
        touched: touchedFields,
      }));

      if (validateForm()) {
        onSubmit(formState.values);
      }
    },
    [config, formState.values, validateForm]
  );

  const reset = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: true,
      isDirty: false,
    });
  }, [initialValues]);

  const setFieldValue = useCallback(
    (name: keyof T, value: any) => {
      setFormState((prev) => ({
        ...prev,
        values: { ...prev.values, [name]: value },
        isDirty: true,
      }));

      const error = validateField(name, value);
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: error },
      }));
    },
    [validateField]
  );

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
  };
}

// Common validation rules
export const validationRules = {
  required: (value: any): string | null =>
    !value ? 'This field is required' : null,

  email: (value: string): string | null =>
    value && !VALIDATION.EMAIL_REGEX.test(value)
      ? 'Please enter a valid email address'
      : null,

  phone: (value: string): string | null =>
    value && !VALIDATION.PHONE_REGEX.test(value)
      ? 'Please enter a valid phone number'
      : null,

  minLength: (length: number) => (value: string): string | null =>
    value && value.length < length
      ? `Must be at least ${length} characters`
      : null,

  maxLength: (length: number) => (value: string): string | null =>
    value && value.length > length
      ? `Must be no more than ${length} characters`
      : null,

  password: (value: string): string | null => {
    if (!value) return null;
    if (value.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`;
    }
    if (value.length > VALIDATION.MAX_PASSWORD_LENGTH) {
      return `Password must be no more than ${VALIDATION.MAX_PASSWORD_LENGTH} characters`;
    }
    return null;
  },
};

// Example usage:
/*
const form = useForm({
  email: {
    initialValue: '',
    validate: validationRules.email,
    required: true,
  },
  password: {
    initialValue: '',
    validate: validationRules.password,
    required: true,
  },
});

// In component:
<form onSubmit={form.handleSubmit(handleLogin)}>
  <input
    name="email"
    value={form.values.email}
    onChange={form.handleChange}
    onBlur={() => form.handleBlur('email')}
  />
  {form.touched.email && form.errors.email && (
    <span>{form.errors.email}</span>
  )}
</form>
*/