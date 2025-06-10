import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../components/common/Logo";
import { ArrowRight } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Traveler",
  });

  const [toastVisible, setToastVisible] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const result = await register({
        name: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (result.success) {
        // Show success notification
        setToastVisible(true);
        setTimeout(() => {
          setToastVisible(false);
          // Redirect based on role
          if (formData.role === "Tour Guide") {
            navigate("/guide/dashboard");
          } else {
            navigate("/home");
          }
        }, 2000);
      } else {
        setError(result.error || "Registration failed");
      }
    } catch {
      setError("Registration failed. Please try again.");
    }

    setIsLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
        {" "}
        <div className="flex flex-col items-center animate-fadeIn">
          <Logo className="w-32 h-32" width={128} height={128} />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start your journey with WanderWise today
          </p>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm animate-fadeIn">
            {error}
          </div>
        )}
        <form
          className="mt-8 space-y-6 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl animate-fadeIn animation-delay-150"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div className="transform transition-all duration-200 hover:-translate-y-0.5">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-500"
                placeholder="Choose your username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="transform transition-all duration-200 hover:-translate-y-0.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-500"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="transform transition-all duration-200 hover:-translate-y-0.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-500"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="transform transition-all duration-200 hover:-translate-y-0.5">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-500"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="transform transition-all duration-200 hover:-translate-y-0.5">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-500"
                defaultValue="Traveler"
                onChange={handleChange}
              >
                <option value="Traveler">Traveler</option>
                <option value="Tour Guide">Tour Guide</option>
              </select>
            </div>
          </div>{" "}
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

      <div
        className={`fixed inset-0 flex items-center justify-center z-50 ${
          toastVisible ? "" : "hidden"
        }`}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <p className="text-lg font-semibold text-gray-800 mb-4">
            Account created successfully!
          </p>
          <button
            onClick={() => setToastVisible(false)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
