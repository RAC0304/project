import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEnhancedAuth } from "../contexts/EnhancedAuthContextFix";
import Logo from "../components/common/Logo";
import { User, Shield, MapPin } from "lucide-react";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useEnhancedAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Demo user credentials with different roles
  const demoUsers = [
    {
      email: "user@wanderwise.com",
      password: "user123",
      role: "Traveler",
      icon: User,
      description: "Regular user with booking and review access",
      color: "text-blue-600",
    },
    {
      email: "guide@wanderwise.com",
      password: "guide123",
      role: "Tour Guide",
      icon: MapPin,
      description: "Guide with booking management and content creation",
      color: "text-green-600",
    },
    {
      email: "admin@wanderwise.com",
      password: "admin123",
      role: "Administrator",
      icon: Shield,
      description: "Full system access and user management",
      color: "text-purple-600",
    },
  ];  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const result = await login(emailOrUsername, password);
    if (result.success) {
      // Check user role from local storage since the context might not be updated yet
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role === "tour_guide") {
          navigate("/guide/dashboard");
        } else if (user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/home");
        }
      } else {
        navigate("/home");
      }
    } else {
      setError(result.error || "Login failed");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-600 p-4">
      <div className="absolute inset-0 bg-pattern opacity-10"></div>{" "}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10"
      >
        {" "}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate("/home")}
          type="button"
          className="absolute left-4 top-4 p-2 rounded-xl text-teal-600 hover:bg-teal-50/50 
            transform hover:scale-[1.05] transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </motion.button>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-6"
        >
          <motion.div
            initial={{ rotate: -5 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
            className="w-32 h-32 mb-6 relative group"
          >
            {" "}
            <Logo
              className="w-full h-full drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
              width={128}
              height={128}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent to-teal-500/10 pointer-events-none"></div>
          </motion.div>
          <motion.h1
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold text-teal-800 tracking-tight"
          >
            Login Wanderwise
          </motion.h1>
          <div className="h-1 w-20 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full mt-4"></div>
        </motion.div>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >            <label
              htmlFor="emailOrUsername"
              className="block text-teal-800 font-medium mb-2 text-sm uppercase tracking-wide"
            >
              Email or Username
            </label>            <div className="relative">
              <input
                type="text"
                id="emailOrUsername"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-5 py-3.5 border-2 border-teal-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm pl-12"
                placeholder="Enter your email or username"
                required
              />
              <div className="text-xs text-teal-600 mt-1 ml-2">You can use either email or username to login</div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 absolute left-3 top-3.5 text-teal-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </motion.div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label
              htmlFor="password"
              className="block text-teal-800 font-medium mb-2 text-sm uppercase tracking-wide"
            >
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 border-2 border-teal-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm pl-12"
                placeholder="Enter your password"
                required
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 absolute left-3 top-3.5 text-teal-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </motion.div>
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium tracking-wide 
              transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg
              ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </motion.button>{" "}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => navigate("/register")}
            type="button"
            className="w-full mt-4 py-3 bg-white/50 text-teal-700 rounded-xl font-medium tracking-wide
              transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg
              hover:bg-teal-50 border-2 border-transparent hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Don't have an account? Register here
          </motion.button>{" "}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-teal-50/50 rounded-xl border border-teal-200"
          >
            <h3 className="text-sm font-semibold text-teal-800 mb-3 text-center">
              Demo Accounts by Role
            </h3>
            <div className="space-y-3">
              {demoUsers.map((user, index) => {
                const IconComponent = user.icon;
                return (
                  <motion.div
                    key={user.email}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="bg-white/70 rounded-lg p-3 border border-teal-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <IconComponent
                          className={`w-4 h-4 mr-2 ${user.color}`}
                        />
                        <span className="font-medium text-teal-800 text-sm">
                          {user.role}
                        </span>
                      </div>                      <button
                        type="button"
                        onClick={() => {
                          setEmailOrUsername(user.email);
                          setPassword(user.password);
                        }}
                        className="text-xs text-teal-600 hover:text-teal-800 font-medium px-2 py-1 rounded bg-teal-100 hover:bg-teal-200 transition-colors"
                      >
                        Use
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {user.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      <div>Email: {user.email}</div>
                      <div>Password: {user.password}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs text-teal-600">
                Click "Use" to auto-fill credentials
              </p>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
