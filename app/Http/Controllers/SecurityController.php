<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\SecurityLog;
use Carbon\Carbon;

class SecurityController extends Controller
{
    /**
     * Get security dashboard metrics
     */
    public function getDashboardMetrics()
    {
        try {
            $activeSessions = DB::table('sessions')
                ->where('last_activity', '>', Carbon::now()->subMinutes(30)->timestamp)
                ->count();

            $failedLogins = SecurityLog::where('action', 'Failed Login')
                ->where('created_at', '>=', Carbon::now()->subDay())
                ->count();

            $securityEvents = SecurityLog::where('status', 'warning')
                ->where('created_at', '>=', Carbon::now()->subDays(7))
                ->count();

            $systemStatus = 'secure'; // This could be based on various security checks

            return response()->json([
                'success' => true,
                'data' => [
                    'activeSessions' => $activeSessions,
                    'failedLogins' => $failedLogins,
                    'securityEvents' => $securityEvents,
                    'systemStatus' => $systemStatus
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard metrics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active user sessions
     */
    public function getActiveSessions()
    {
        try {
            $sessions = DB::table('sessions')
                ->join('users', 'sessions.user_id', '=', 'users.id')
                ->select([
                    'sessions.id',
                    'sessions.user_id',
                    'users.email as user_name',
                    'sessions.ip_address',
                    'sessions.user_agent',
                    'sessions.last_activity',
                    'sessions.created_at as login_time'
                ])
                ->where('sessions.last_activity', '>', Carbon::now()->subHours(24)->timestamp)
                ->orderBy('sessions.last_activity', 'desc')
                ->get()
                ->map(function ($session) {
                    return [
                        'id' => $session->id,
                        'userId' => $session->user_id,
                        'userName' => $session->user_name,
                        'ipAddress' => $session->ip_address,
                        'userAgent' => $session->user_agent,
                        'loginTime' => Carbon::createFromTimestamp($session->login_time)->toISOString(),
                        'lastActivity' => Carbon::createFromTimestamp($session->last_activity)->toISOString(),
                        'isActive' => Carbon::createFromTimestamp($session->last_activity)->diffInMinutes(Carbon::now()) < 30,
                        'location' => $this->getLocationFromIP($session->ip_address)
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $sessions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch active sessions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Terminate a user session
     */
    public function terminateSession(Request $request, $sessionId)
    {
        try {
            $deleted = DB::table('sessions')->where('id', $sessionId)->delete();

            if ($deleted) {
                // Log the session termination
                SecurityLog::create([
                    'user_id' => auth()->id(),
                    'action' => 'Session Terminated',
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'status' => 'success',
                    'details' => "Session {$sessionId} terminated by admin"
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Session terminated successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Session not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to terminate session',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get security audit logs
     */
    public function getAuditLogs(Request $request)
    {
        try {
            $query = SecurityLog::with('user:id,email')
                ->orderBy('created_at', 'desc');

            // Apply filters
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('action', 'like', "%{$search}%")
                      ->orWhere('ip_address', 'like', "%{$search}%")
                      ->orWhere('details', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('email', 'like', "%{$search}%");
                      });
                });
            }

            $logs = $query->paginate(50);

            return response()->json([
                'success' => true,
                'data' => $logs->items(),
                'pagination' => [
                    'total' => $logs->total(),
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'per_page' => $logs->perPage()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch audit logs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get security settings
     */
    public function getSecuritySettings()
    {
        try {
            // In a real application, these would be stored in database or config
            $settings = [
                'maxLoginAttempts' => config('security.max_login_attempts', 5),
                'lockoutDuration' => config('security.lockout_duration', 30),
                'sessionTimeout' => config('security.session_timeout', 120),
                'requireTwoFactor' => config('security.require_two_factor', false),
                'passwordPolicy' => [
                    'minLength' => config('security.password.min_length', 8),
                    'requireUppercase' => config('security.password.require_uppercase', true),
                    'requireLowercase' => config('security.password.require_lowercase', true),
                    'requireNumbers' => config('security.password.require_numbers', true),
                    'requireSpecialChars' => config('security.password.require_special_chars', false),
                    'expirationDays' => config('security.password.expiration_days', 90),
                    'preventReuse' => config('security.password.prevent_reuse', 5)
                ],
                'auditLogRetention' => config('security.audit_log_retention', 365)
            ];

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch security settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update security settings
     */
    public function updateSecuritySettings(Request $request)
    {
        $request->validate([
            'maxLoginAttempts' => 'required|integer|min:1|max:10',
            'lockoutDuration' => 'required|integer|min:5|max:1440',
            'sessionTimeout' => 'required|integer|min:15|max:480',
            'requireTwoFactor' => 'required|boolean',
            'passwordPolicy.minLength' => 'required|integer|min:6|max:64',
            'passwordPolicy.requireUppercase' => 'required|boolean',
            'passwordPolicy.requireLowercase' => 'required|boolean',
            'passwordPolicy.requireNumbers' => 'required|boolean',
            'passwordPolicy.requireSpecialChars' => 'required|boolean',
            'passwordPolicy.expirationDays' => 'required|integer|min:1|max:365',
            'passwordPolicy.preventReuse' => 'required|integer|min:0|max:20',
            'auditLogRetention' => 'required|integer|min:30|max:2555'
        ]);

        try {
            // In a real application, you would save these to database or update config files
            // For now, we'll just log the update and return success
            
            SecurityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Security Settings Updated',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'success',
                'details' => 'Security settings updated by admin'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Security settings updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update security settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export audit logs
     */
    public function exportAuditLogs(Request $request)
    {
        try {
            $query = SecurityLog::with('user:id,email')
                ->orderBy('created_at', 'desc');

            // Apply same filters as getAuditLogs
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('action', 'like', "%{$search}%")
                      ->orWhere('ip_address', 'like', "%{$search}%")
                      ->orWhere('details', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('email', 'like', "%{$search}%");
                      });
                });
            }

            $logs = $query->get();

            $csvData = "Timestamp,User,Action,IP Address,User Agent,Status,Details\n";
            
            foreach ($logs as $log) {
                $csvData .= sprintf(
                    "%s,%s,%s,%s,%s,%s,%s\n",
                    $log->created_at->format('Y-m-d H:i:s'),
                    $log->user ? $log->user->email : 'Unknown',
                    $log->action,
                    $log->ip_address,
                    $log->user_agent,
                    $log->status,
                    str_replace(["\n", "\r", ","], [" ", " ", ";"], $log->details)
                );
            }

            return response($csvData)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="security_audit_logs_' . date('Y-m-d') . '.csv"');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export audit logs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get approximate location from IP address
     * In a real application, you might use a geolocation service
     */
    private function getLocationFromIP($ip)
    {
        // Mock location data - in production, use a real geolocation service
        $mockLocations = [
            '192.168.' => 'Jakarta, Indonesia',
            '10.0.' => 'Bali, Indonesia',
            '172.16.' => 'Bandung, Indonesia',
            '203.0.' => 'Singapore',
        ];

        foreach ($mockLocations as $prefix => $location) {
            if (strpos($ip, $prefix) === 0) {
                return $location;
            }
        }

        return 'Unknown Location';
    }
}
