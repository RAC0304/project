<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Security Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the security configuration options for the WanderWise
    | application. These settings control various security features like
    | login attempts, session timeouts, and password policies.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Authentication Security
    |--------------------------------------------------------------------------
    */
    'max_login_attempts' => env('SECURITY_MAX_LOGIN_ATTEMPTS', 5),
    'lockout_duration' => env('SECURITY_LOCKOUT_DURATION', 30), // minutes
    'session_timeout' => env('SECURITY_SESSION_TIMEOUT', 120), // minutes
    'require_two_factor' => env('SECURITY_REQUIRE_TWO_FACTOR', false),

    /*
    |--------------------------------------------------------------------------
    | Password Policy
    |--------------------------------------------------------------------------
    */
    'password' => [
        'min_length' => env('SECURITY_PASSWORD_MIN_LENGTH', 8),
        'require_uppercase' => env('SECURITY_PASSWORD_REQUIRE_UPPERCASE', true),
        'require_lowercase' => env('SECURITY_PASSWORD_REQUIRE_LOWERCASE', true),
        'require_numbers' => env('SECURITY_PASSWORD_REQUIRE_NUMBERS', true),
        'require_special_chars' => env('SECURITY_PASSWORD_REQUIRE_SPECIAL_CHARS', false),
        'expiration_days' => env('SECURITY_PASSWORD_EXPIRATION_DAYS', 90),
        'prevent_reuse' => env('SECURITY_PASSWORD_PREVENT_REUSE', 5),
    ],

    /*
    |--------------------------------------------------------------------------
    | Audit and Logging
    |--------------------------------------------------------------------------
    */
    'audit_log_retention' => env('SECURITY_AUDIT_LOG_RETENTION', 365), // days
    'log_failed_logins' => env('SECURITY_LOG_FAILED_LOGINS', true),
    'log_successful_logins' => env('SECURITY_LOG_SUCCESSFUL_LOGINS', true),
    'log_password_changes' => env('SECURITY_LOG_PASSWORD_CHANGES', true),
    'log_admin_actions' => env('SECURITY_LOG_ADMIN_ACTIONS', true),

    /*
    |--------------------------------------------------------------------------
    | Session Security
    |--------------------------------------------------------------------------
    */
    'session' => [
        'secure_cookies' => env('SESSION_SECURE_COOKIE', true),
        'same_site' => env('SESSION_SAME_SITE', 'lax'),
        'http_only' => true,
        'encrypt' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | IP Address Restrictions
    |--------------------------------------------------------------------------
    */
    'allowed_ips' => [
        // Add specific IP addresses or ranges that are always allowed
        // '192.168.1.0/24',
        // '10.0.0.0/8',
    ],

    'blocked_ips' => [
        // Add IP addresses that should be blocked
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Headers
    |--------------------------------------------------------------------------
    */
    'headers' => [
        'x_frame_options' => 'DENY',
        'x_content_type_options' => 'nosniff',
        'x_xss_protection' => '1; mode=block',
        'referrer_policy' => 'strict-origin-when-cross-origin',
        'content_security_policy' => [
            'default-src' => "'self'",
            'script-src' => "'self' 'unsafe-inline' 'unsafe-eval'",
            'style-src' => "'self' 'unsafe-inline'",
            'img-src' => "'self' data: https:",
            'font-src' => "'self' data:",
            'connect-src' => "'self'",
        ],
    ],
];
