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

        if (!$apiKey) {
            return response()->json(['message' => 'Unauthorized, no token found'], 401);
        }

        if (!preg_match('/^(?i)bearer\s+([^\s]+)$/', $apiKey, $matches)) {
            return response()->json(['message' => 'Unauthorized, invalid token format'], 401);
        }

        $tokenString = $matches[1]; // "Bearer " を除去
        $token = PersonalAccessToken::findToken($tokenString);

        if (!$token) {
            return response()->json(['message' => 'Unauthorized, invalid token'], 401);
        }


        // スコープチェック（必要に応じてスコープを追加）
        if (!$token->can('file:manage')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // IP制限の適用
        $allowedIps = [];
        if(isset($token->allowed_ips)) {
            $allowedIps = explode(',', str_replace([" ", "\t", "\n", "\r"], "", $token->allowed_ips));
        }
        $requestIp = $request->ip();

        // Check if the request IP is a loopback address (IPv4 or IPv6)
        $isLoopback = in_array($requestIp, ['127.0.0.1', '::1']);

        // Check if the request IP is in the allowed IPs or if it's a loopback address and 'localhost' is allowed
        $isAllowed = in_array($requestIp, $allowedIps) || ($isLoopback && in_array('localhost', $allowedIps));

        if (!empty($allowedIps) && !$isAllowed) {
            return response()->json(['message' => 'Access denied from this IP:' . $requestIp], 403);
        }

        // ユーザーを認証済み状態にする（オプション）
        auth()->setUser($token->tokenable);

        return $next($request);
    }
}
