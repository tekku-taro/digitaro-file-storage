<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoritesController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function favorite($id)
    {
        /** @var User $user */
        $user = Auth::user();
        $result = $user->favoriteFile($id);
        return response()->json(['result' => $result ? 'success': 'failure']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function unfavorite($id)
    {
        /** @var User $user */
        $user = Auth::user();
        $result = $user->unfavoriteFile($id);
        return response()->json(['result' => $result ? 'success': 'failure']);
    }
}
