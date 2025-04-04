<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class HandleApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('Authorization');

        if (!$apiKey || !str_starts_with($apiKey, 'Bearer ')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $tokenString = substr($apiKey, 7); // "Bearer " を除去  <= 改善の余地あり
        $token = PersonalAccessToken::findToken($tokenString);

        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }


        // スコープチェック（必要に応じてスコープを追加）
        if (!$token->can('file:manage')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // IP制限の適用
        $allowedIps = explode(',', str_replace([" ", "\t", "\n", "\r"], "", $token->allowed_ips));
        $requestIp = $request->ip();

        if (!empty($allowedIps) && !in_array($requestIp, $allowedIps)) {
            return response()->json(['message' => 'Access denied from this IP:' . $requestIp], 403);
        }

        // ユーザーを認証済み状態にする（オプション）
        auth()->setUser($token->tokenable);

        return $next($request);
    }
}
