<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SecurityController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('auth.forgot-password');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('auth.reset-password');
});

// Protected authentication routes (require authentication)
Route::middleware(['auth:sanctum'])->prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::post('/logout-all', [AuthController::class, 'logoutAll'])->name('auth.logout-all');
    Route::get('/profile', [AuthController::class, 'profile'])->name('auth.profile');
    Route::post('/refresh', [AuthController::class, 'refresh'])->name('auth.refresh');
    Route::get('/check-session', [AuthController::class, 'checkSession'])->name('auth.check-session');
});

// Health check route
Route::get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'message' => 'API is running',
        'timestamp' => now(),
        'version' => '1.0.0'
    ]);
})->name('api.health');

// Protected API routes
Route::middleware(['auth:sanctum'])->group(function () {
    
    // User routes
    Route::prefix('user')->group(function () {
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::put('/profile', 'UserController@updateProfile');
        Route::post('/change-password', 'UserController@changePassword');
        Route::delete('/account', 'UserController@deleteAccount');
    });

    // Tour Guide routes
    Route::middleware(['role:tour_guide,admin'])->prefix('tour-guide')->group(function () {
        Route::get('/dashboard', 'TourGuideController@dashboard');
        Route::get('/tours', 'TourGuideController@tours');
        Route::post('/tours', 'TourGuideController@createTour');
        Route::put('/tours/{id}', 'TourGuideController@updateTour');
        Route::delete('/tours/{id}', 'TourGuideController@deleteTour');
        Route::get('/bookings', 'TourGuideController@bookings');
        Route::get('/clients', 'TourGuideController@clients');
        Route::get('/reviews', 'TourGuideController@reviews');
        Route::post('/reviews/{id}/response', 'TourGuideController@respondToReview');
    });    // Admin routes
    Route::middleware(['role:admin'])->prefix('admin')->group(function () {
        Route::get('/dashboard', 'AdminController@dashboard');
        Route::get('/users', 'AdminController@users');
        Route::get('/analytics', 'AdminController@analytics');
        Route::get('/reports', 'AdminController@reports');
        
        // Security management routes
        Route::prefix('security')->group(function () {
            Route::get('/dashboard', [SecurityController::class, 'getDashboardMetrics']);
            Route::get('/sessions', [SecurityController::class, 'getActiveSessions']);
            Route::delete('/sessions/{sessionId}', [SecurityController::class, 'terminateSession']);
            Route::get('/logs', [SecurityController::class, 'getAuditLogs']);
            Route::get('/logs/export', [SecurityController::class, 'exportAuditLogs']);
            Route::get('/settings', [SecurityController::class, 'getSecuritySettings']);
            Route::put('/settings', [SecurityController::class, 'updateSecuritySettings']);
        });
    });
});
