import React, { useEffect, useState } from "react";
import { useEnhancedAuth } from "../contexts/useEnhancedAuth";

const TestSessionPage: React.FC = () => {
  const { user, isLoggedIn, isInitialized, refreshSession } = useEnhancedAuth();
  const [refreshCount, setRefreshCount] = useState(0);
  const [timeSinceLogin, setTimeSinceLogin] = useState(0);

  // Get session information from localStorage
  const sessionInfo = {
    timestamp: localStorage.getItem("wanderwise_sessionTimestamp"),
    timeout: localStorage.getItem("wanderwise_sessionTimeout"),
    isLoggedIn: localStorage.getItem("wanderwise_isLoggedIn"),
  };

  // Track time since login
  useEffect(() => {
    if (isLoggedIn && sessionInfo.timestamp) {
      const loginTime = parseInt(sessionInfo.timestamp);
      const interval = setInterval(() => {
        setTimeSinceLogin(Math.floor((Date.now() - loginTime) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, sessionInfo.timestamp]);

  // Refresh session every 10 seconds to test timestamp updates
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(() => {
        refreshSession().then(() => {
          setRefreshCount((prev) => prev + 1);
        });
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, refreshSession]);

  if (!isInitialized) {
    return <div className="p-8">Loading session...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-teal-600">
        Session Test Page
      </h1>

      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="font-medium">Status:</div>
          <div
            className={`font-bold ${
              isLoggedIn ? "text-green-600" : "text-red-600"
            }`}
          >
            {isLoggedIn ? "Logged In" : "Logged Out"}
          </div>

          <div className="font-medium">Initialization:</div>
          <div
            className={`font-bold ${
              isInitialized ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {isInitialized ? "Complete" : "In Progress"}
          </div>

          <div className="font-medium">Time Since Login:</div>
          <div>{timeSinceLogin} seconds</div>

          <div className="font-medium">Session Refreshes:</div>
          <div>{refreshCount}</div>
        </div>
      </div>

      {user && (
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium">Name:</div>
            <div>
              {user.profile.firstName} {user.profile.lastName}
            </div>

            <div className="font-medium">Email:</div>
            <div>{user.email}</div>

            <div className="font-medium">Role:</div>
            <div className="capitalize">{user.role}</div>

            <div className="font-medium">User ID:</div>
            <div>{user.id}</div>
          </div>
        </div>
      )}

      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Session Storage</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="font-medium">Session Timestamp:</div>
          <div>
            {sessionInfo.timestamp
              ? new Date(parseInt(sessionInfo.timestamp)).toLocaleString()
              : "Not set"}
            <br />
            <span className="text-sm text-gray-500">
              {sessionInfo.timestamp ? `(${sessionInfo.timestamp})` : ""}
            </span>
          </div>

          <div className="font-medium">Session Timeout:</div>
          <div>
            {sessionInfo.timeout
              ? `${parseInt(sessionInfo.timeout) / (1000 * 60 * 60)} hours`
              : "Not set"}
            <br />
            <span className="text-sm text-gray-500">
              {sessionInfo.timeout ? `(${sessionInfo.timeout})` : ""}
            </span>
          </div>

          <div className="font-medium">IsLoggedIn Flag:</div>
          <div>{sessionInfo.isLoggedIn || "Not set"}</div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Reload Page
        </button>

        <button
          onClick={() => refreshSession()}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Refresh Session
        </button>
      </div>
    </div>
  );
};

export default TestSessionPage;
