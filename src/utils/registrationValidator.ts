// Registration validation utilities
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  dateOfBirth?: string;
}

export class RegistrationValidator {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    if (password.length > 128) {
      errors.push("Password must be less than 128 characters");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'password123', 'admin', 'qwerty'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push("Please choose a stronger password");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUsername(username: string): ValidationResult {
    const errors: string[] = [];

    if (username.length < 3) {
      errors.push("Username must be at least 3 characters long");
    }

    if (username.length > 30) {
      errors.push("Username must be less than 30 characters");
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      errors.push("Username can only contain letters, numbers, dots, hyphens, and underscores");
    }

    if (/^[._-]/.test(username) || /[._-]$/.test(username)) {
      errors.push("Username cannot start or end with special characters");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateName(name: string, fieldName: string): ValidationResult {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push(`${fieldName} is required`);
    }

    if (name.length > 50) {
      errors.push(`${fieldName} must be less than 50 characters`);
    }

    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validatePhone(phone: string): ValidationResult {
    const errors: string[] = [];

    if (phone && phone.length > 0) {
      // Indonesian phone number validation
      const phoneRegex = /^(\+62|62|0)[2-9]\d{7,11}$/;
      if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
        errors.push("Please enter a valid Indonesian phone number");
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateAge(dateOfBirth: string): ValidationResult {
    const errors: string[] = [];

    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        // Adjust age if birthday hasn't occurred this year
      }

      if (age < 13) {
        errors.push("You must be at least 13 years old to register");
      }

      if (age > 120) {
        errors.push("Please enter a valid date of birth");
      }

      if (birthDate > today) {
        errors.push("Date of birth cannot be in the future");
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateRegistrationData(data: RegistrationData): ValidationResult {
    const allErrors: string[] = [];

    // Validate email
    if (!data.email) {
      allErrors.push("Email is required");
    } else if (!this.validateEmail(data.email)) {
      allErrors.push("Please enter a valid email address");
    }

    // Validate username
    const usernameValidation = this.validateUsername(data.username);
    allErrors.push(...usernameValidation.errors);

    // Validate password
    const passwordValidation = this.validatePassword(data.password);
    allErrors.push(...passwordValidation.errors);

    // Validate password confirmation
    if (data.password !== data.confirmPassword) {
      allErrors.push("Passwords do not match");
    }

    // Validate first name
    const firstNameValidation = this.validateName(data.firstName, "First name");
    allErrors.push(...firstNameValidation.errors);

    // Validate last name
    const lastNameValidation = this.validateName(data.lastName, "Last name");
    allErrors.push(...lastNameValidation.errors);

    // Validate role
    const validRoles = ["Traveler", "Tour Guide"];
    if (!validRoles.includes(data.role)) {
      allErrors.push("Please select a valid role");
    }

    // Validate optional fields
    if (data.phone) {
      const phoneValidation = this.validatePhone(data.phone);
      allErrors.push(...phoneValidation.errors);
    }

    if (data.dateOfBirth) {
      const ageValidation = this.validateAge(data.dateOfBirth);
      allErrors.push(...ageValidation.errors);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }
}
