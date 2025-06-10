import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RegistrationValidator, RegistrationData, ValidationResult } from '../utils/registrationValidator';

export interface UseRegistrationReturn {
  formData: RegistrationData;
  errors: string[];
  isLoading: boolean;
  isSuccess: boolean;
  fieldErrors: Record<string, string[]>;
  updateField: (field: keyof RegistrationData, value: string) => void;
  validateField: (field: keyof RegistrationData) => void;
  validateForm: () => boolean;
  submitRegistration: () => Promise<boolean>;
  resetForm: () => void;
  clearErrors: () => void;
}

const initialFormData: RegistrationData = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  role: 'Traveler',
  phone: '',
  dateOfBirth: ''
};

export const useRegistration = (): UseRegistrationReturn => {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegistrationData>(initialFormData);
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateField = useCallback((field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: [] }));
    }
    
    // Clear general errors
    if (errors.length > 0) {
      setErrors([]);
    }
  }, [fieldErrors, errors.length]);

  const validateField = useCallback((field: keyof RegistrationData) => {
    const value = formData[field];
    let validation: ValidationResult;

    switch (field) {
      case 'email':
        validation = { 
          isValid: RegistrationValidator.validateEmail(value), 
          errors: RegistrationValidator.validateEmail(value) ? [] : ['Please enter a valid email address']
        };
        break;
      case 'username':
        validation = RegistrationValidator.validateUsername(value);
        break;
      case 'password':
        validation = RegistrationValidator.validatePassword(value);
        break;
      case 'confirmPassword':
        validation = {
          isValid: value === formData.password,
          errors: value === formData.password ? [] : ['Passwords do not match']
        };
        break;
      case 'firstName':
        validation = RegistrationValidator.validateName(value, 'First name');
        break;
      case 'lastName':
        validation = RegistrationValidator.validateName(value, 'Last name');
        break;
      case 'phone':
        validation = RegistrationValidator.validatePhone(value);
        break;
      case 'dateOfBirth':
        validation = RegistrationValidator.validateAge(value);
        break;
      default:
        validation = { isValid: true, errors: [] };
    }

    setFieldErrors(prev => ({ ...prev, [field]: validation.errors }));
    return validation.isValid;
  }, [formData]);

  const validateForm = useCallback((): boolean => {
    const validation = RegistrationValidator.validateRegistrationData(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      
      // Set field-specific errors
      const newFieldErrors: Record<string, string[]> = {};
      validation.errors.forEach(error => {
        if (error.includes('Email')) newFieldErrors.email = [error];
        if (error.includes('Username') || error.includes('username')) newFieldErrors.username = [error];
        if (error.includes('Password') || error.includes('password')) {
          if (error.includes('match')) {
            newFieldErrors.confirmPassword = [error];
          } else {
            newFieldErrors.password = [...(newFieldErrors.password || []), error];
          }
        }
        if (error.includes('First name')) newFieldErrors.firstName = [error];
        if (error.includes('Last name')) newFieldErrors.lastName = [error];
        if (error.includes('phone')) newFieldErrors.phone = [error];
        if (error.includes('age') || error.includes('birth')) newFieldErrors.dateOfBirth = [error];
      });
      
      setFieldErrors(newFieldErrors);
    }

    return validation.isValid;
  }, [formData]);

  const submitRegistration = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setErrors([]);
    setIsSuccess(false);

    try {
      // Validate form before submission
      if (!validateForm()) {
        setIsLoading(false);
        return false;
      }

      // Extract name parts
      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();

      const result = await register({
        name: `${firstName} ${lastName}`,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: formData.role,
        phone: formData.phone || undefined,
      });

      if (result.success) {
        setIsSuccess(true);
        setFormData(initialFormData); // Reset form
        return true;
      } else {
        setErrors([result.error || 'Registration failed. Please try again.']);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors(['An unexpected error occurred. Please try again.']);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [formData, register, validateForm]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors([]);
    setFieldErrors({});
    setIsSuccess(false);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
    setFieldErrors({});
  }, []);

  return {
    formData,
    errors,
    isLoading,
    isSuccess,
    fieldErrors,
    updateField,
    validateField,
    validateForm,
    submitRegistration,
    resetForm,
    clearErrors
  };
};
