<?php

use App\Http\Controllers\FavoritesController;
use App\Http\Controllers\FilesController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::resource('/files', FilesController::class);
    Route::get('/favorites', [FilesController::class, 'favorites'])->name('favorites.index');
    Route::get('/trash', [FilesController::class, 'trash'])->name('trash.index');
    Route::post('/files/upload', [FilesController::class, 'upload'])->name('files.upload');
    Route::get('/files/{id}/download', [FilesController::class, 'download'])->name('files.download');
    Route::post('/favorite/{id}', [FavoritesController::class, 'favorite'])->name('favorite');
    Route::delete('/unfavorite/{id}', [FavoritesController::class, 'unfavorite'])->name('unfavorite');


    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
