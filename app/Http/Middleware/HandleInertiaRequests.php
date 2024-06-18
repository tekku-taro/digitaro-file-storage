<?php

namespace App\Http\Middleware;

use App\Models\Group;
use App\Support\UploadSpaceManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'commons' => [
                'upload_url' => Storage::disk('uploads')->url(''),
                'selected_group' => Group::find($request->group_id) ?? Auth::user()?->userGroups->first(),
                'storage_status' => UploadSpaceManager::getCurrentStorageStatus(),
                'chunk_upload_size' => \ByteUnits\parse(config('upload.chunk_upload_size'))->numberOfBytes(),
            ],
        ];
    }
}
