<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Rules\IpAddresses;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Validator;

class ApiKeyController extends Controller
{
    /**
     * Display a listing of the user's API keys.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        /** @var User $user */
        $user = Auth::user();
        $tokens = $user->tokens()->get()->map(function ($token) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'allowed_ips' => $token->allowed_ips,
                'created_at' => $token->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json($tokens);
    }

    /**
     * Store a newly created API key in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'allowed_ips' => ['nullable','string', new IpAddresses], // カンマ区切りのIPリスト
        ]);

        if ($validator->fails()) {
            $response['errors']  = $validator->errors()->toArray();
            return response()->json($response, 422);
        }

        // バリデーション済みデータの取得
        $validated = $validator->validated();

        /** @var User $user */
        $user = Auth::user();


        $allowedIps = trim($validated['allowed_ips']);

        // Create a new token with abilities and IP restrictions if needed
        $token = $user->createToken(
            $validated['name'],
            ['file:manage'], // 'file:manage' をスコープに設定
            !empty($allowedIps) ? $allowedIps : null, // 許可IPを保存
            null, // No expiration
        );


        return response()->json([
            'token' => $token->plainTextToken,
            'name' => $validated['name'],
            'allowed_ips' => $validated['allowed_ips'],
        ]);
    }

    /**
     * Remove the specified API key from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        /** @var User $user */
        $user = Auth::user();
        $token = $user->tokens()->where('id', $id)->first();

        if (!$token) {
            return response()->json(['message' => 'トークンが見つかりません。'], 404);
        }

        $token->delete();

        return response()->json(['message' => 'トークンを削除しました。']);
    }
}
