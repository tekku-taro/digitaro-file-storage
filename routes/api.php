<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['apikey'])->group(function () {
    Route::post('/files/upload', [App\Http\Controllers\Api\FilesController::class, 'upload'])->name('api.upload');
    Route::get('/files/download', [App\Http\Controllers\Api\FilesController::class, 'download'])->name('api.download');
    Route::delete('/files', [App\Http\Controllers\Api\FilesController::class, 'destroy'])->name('api.delete');
});
