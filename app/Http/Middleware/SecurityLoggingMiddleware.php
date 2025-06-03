<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\SecurityLog;
use Illuminate\Support\Facades\Auth;

class SecurityLoggingMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Log security-relevant actions
        $this->logSecurityAction($request, $response);

        return $response;
    }

    /**
     * Log security-relevant actions
     */
    private function logSecurityAction(Request $request, $response)
    {
        // Define actions that should be logged
        $loggedActions = [
            'POST:/api/auth/login' => 'Login Attempt',
            'POST:/api/auth/logout' => 'Logout',
            'POST:/api/auth/register' => 'Registration',
            'POST:/api/auth/forgot-password' => 'Password Reset Request',
            'POST:/api/auth/reset-password' => 'Password Reset',
            'PUT:/api/user/profile' => 'Profile Update',
            'POST:/api/user/change-password' => 'Password Change',
            'DELETE:/api/user/account' => 'Account Deletion',
        ];

        $routeKey = $request->method() . ':' . $request->getPathInfo();
        
        if (array_key_exists($routeKey, $loggedActions)) {
            $action = $loggedActions[$routeKey];
            $status = $this->determineStatus($response);
            $details = $this->generateDetails($request, $response, $action);

            SecurityLog::create([
                'user_id' => Auth::id(),
                'action' => $action,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent() ?? 'Unknown',
                'status' => $status,
                'details' => $details
            ]);
        }

        // Log failed authentication attempts specifically
        if ($routeKey === 'POST:/api/auth/login' && $response->getStatusCode() === 401) {
            SecurityLog::create([
                'user_id' => null,
                'action' => 'Failed Login',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent() ?? 'Unknown',
                'status' => 'failed',
                'details' => 'Invalid credentials provided for email: ' . $request->input('email', 'unknown')
            ]);
        }
    }

    /**
     * Determine the status based on response
     */
    private function determineStatus($response): string
    {
        $statusCode = $response->getStatusCode();

        if ($statusCode >= 200 && $statusCode < 300) {
            return 'success';
        } elseif ($statusCode >= 400 && $statusCode < 500) {
            return 'failed';
        } else {
            return 'warning';
        }
    }

    /**
     * Generate details for the log entry
     */
    private function generateDetails(Request $request, $response, string $action): string
    {
        $details = [];

        // Add relevant details based on action
        switch ($action) {
            case 'Login Attempt':
                $details[] = 'Email: ' . $request->input('email', 'unknown');
                break;
            case 'Registration':
                $details[] = 'Email: ' . $request->input('email', 'unknown');
                $details[] = 'Role: ' . $request->input('role', 'customer');
                break;
            case 'Password Reset Request':
                $details[] = 'Email: ' . $request->input('email', 'unknown');
                break;
            case 'Profile Update':
                $details[] = 'User ID: ' . Auth::id();
                break;
        }

        // Add response status
        $details[] = 'Response Status: ' . $response->getStatusCode();

        return implode(' | ', $details);
    }
}
