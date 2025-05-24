import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import RoleBadge from "../components/common/RoleBadge";

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Shield className="w-10 h-10 text-red-600" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 mb-4"
        >
          Access Denied
        </motion.h1>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>

          {isLoggedIn && user && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">Current role:</p>
              <RoleBadge role={user.role} />
            </div>
          )}

          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact your administrator.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 mt-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>

          <Link
            to="/"
            className="flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 pt-6 border-t border-gray-200"
        >
          <p className="text-xs text-gray-400">
            Need different access level? Contact support or try logging in with
            a different account.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
