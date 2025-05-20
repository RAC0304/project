import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Demo user credentials
  const DEMO_USER = {
    email: "demo@wanderwise.com",
    password: "demo123",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      // Successful login
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify({ email: DEMO_USER.email }));
      navigate("/");
    } else {
      setError("Invalid email or password. Try demo@wanderwise.com / demo123");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-600 p-4">
      <div className="absolute inset-0 bg-pattern opacity-10"></div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10"
      >
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
            className="w-32 h-32 mb-6 rounded-2xl overflow-hidden shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] border-4 border-white"
          >
            <img
              src="/src/asset/image/logologin.jpg"
              alt="Wanderwise Logo"
              className="w-full h-full object-cover"
            />
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
          >
            <label
              htmlFor="email"
              className="block text-teal-800 font-medium mb-2 text-sm uppercase tracking-wide"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 border-2 border-teal-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm pl-12"
                placeholder="Enter your email"
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
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-teal-800 mt-4"
          >
            Demo credentials:
            <br />
            Email: demo@wanderwise.com
            <br />
            Password: demo123
          </motion.p>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
