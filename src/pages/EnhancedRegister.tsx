import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegistration } from "../hooks/useRegistration";
import Logo from "../components/common/Logo";
import { ArrowRight, Eye, EyeOff, Check, X } from "lucide-react";

const EnhancedRegister: React.FC = () => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    isLoading,
    isSuccess,
    fieldErrors,
    updateField,
    validateField,
    submitRegistration,
    clearErrors
  } = useRegistration();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccessToast(true);
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
        // Redirect based on role
        if (formData.role === "Tour Guide") {
          navigate("/guide/dashboard");
        } else {
          navigate("/home");
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, formData.role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    await submitRegistration();
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    updateField(field, value);
  };

  const handleFieldBlur = (field: keyof typeof formData) => {
    if (formData[field]) {
      validateField(field);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength < 2) return { level: "weak", color: "bg-red-500", text: "Weak" };
    if (strength < 4) return { level: "medium", color: "bg-yellow-500", text: "Medium" };
    return { level: "strong", color: "bg-green-500", text: "Strong" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-white" />
        <div className="absolute inset-0 opacity-5">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-teal-600"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                transform: `scale(${Math.random() * 0.5 + 0.5})`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center animate-fadeIn">
          <Logo className="w-32 h-32" width={128} height={128} />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start your journey with WanderWise today
          </p>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 animate-fadeIn">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-sm font-medium text-red-800">
                Please correct the following errors:
              </h3>
            </div>
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Registration Form */}
        <form
          className="mt-8 space-y-6 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl animate-fadeIn animation-delay-150"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            {/* First Name */}
            <div className="transform transition-all duration-200 hover:-translate-y-0.5">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className={`appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-500 ${
                  fieldErrors.firstName?.length > 0 ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                onBlur={() => handleFieldBlur('firstName')}
              />
              {fieldErrors.firstName?.map((error, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
              ))}
            </div>

            {/* Last Name */}
            <div className="transform transition-all duration-200 hover:-translate-y-0.5">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className={`appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-500 ${
                  fieldErrors.lastName?.length > 0 ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                onBlur={() => handleFieldBlur('lastName')}
              />
              {fieldErrors.lastName?.map((error, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
              ))}
            </div>

            {/* Username */}
            <div className="transform transition-all duration-200 hover:-translate-y-0.5">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-500 ${
                  fieldErrors.username?.length > 0 ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Choose your username"
                value={formData.username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                onBlur={() => handleFieldBlur('username')}
              />
              {fieldErrors.username?.map((error, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
              ))}
            </div>

            {/* Email */}
            <div className="transform transition-all duration-200 hover:-translate-y-0.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-500 ${
                  fieldErrors.email?.length > 0 ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={() => handleFieldBlur('email')}
              />
              {fieldErrors.email?.map((error, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
              ))}
            </div>

            {/* Password */}
            <div className="transform transition-all duration-200 hover:-translate-y-0.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-500 ${
                    fieldErrors.password?.length > 0 ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={() => handleFieldBlur('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.level === 'strong' ? 'text-green-600' :
                      passwordStrength.level === 'medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{
                        width: passwordStrength.level === 'strong' ? '100%' :
                               passwordStrength.level === 'medium' ? '66%' : '33%'
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              {fieldErrors.password?.map((error, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
              ))}
            </div>

            {/* Confirm Password */}
            <div className="transform transition-all duration-200 hover:-translate-y-0.5">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-500 ${
                    fieldErrors.confirmPassword?.length > 0 ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  onBlur={() => handleFieldBlur('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-1 flex items-center">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <Check className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-xs text-red-600">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}
              
              {fieldErrors.confirmPassword?.map((error, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
              ))}
            </div>

            {/* Phone (Optional) */}
            <div className="transform transition-all duration-200 hover:-translate-y-0.5">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={`appearance-none relative block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-500 ${
                  fieldErrors.phone?.length > 0 ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., +62 812 3456 7890"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                onBlur={() => handleFieldBlur('phone')}
              />
              {fieldErrors.phone?.map((error, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
              ))}
            </div>

            {/* Role */}
            <div className="transform transition-all duration-200 hover:-translate-y-0.5">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                I want to join as *
              </label>
              <select
                id="role"
                name="role"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-500"
                value={formData.role}
                onChange={(e) => handleFieldChange('role', e.target.value)}
              >
                <option value="Traveler">Traveler</option>
                <option value="Tour Guide">Tour Guide</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transform transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <ArrowRight
                  className="h-5 w-5 text-teal-500 group-hover:text-teal-400 transition-colors"
                  aria-hidden="true"
                />
              </span>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        {/* Sign In Link */}
        <div className="text-center animate-fadeIn animation-delay-300">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-teal-600 hover:text-teal-500 transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center animate-fadeIn">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-2">
              Account created successfully!
            </p>
            <p className="text-sm text-gray-600">
              Redirecting you to your dashboard...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedRegister;
