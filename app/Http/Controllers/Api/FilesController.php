<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DownloadHistory;
use App\Models\File;
use App\Models\FileType;
use App\Models\Group;
use App\Rules\AcceptableFileTypes;
use App\Rules\UploadsCapacity;
use App\Support\ChunkUploadService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;


class FilesController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function upload(Request $request)
    {
        // dd($request->all());
        $validated = $request->validate([
            'is_last_chunk' => ['required', 'boolean'],
            'title' => 'required',
            'nonce' => 'required',
            'sub_path' => 'nullable',
        ]);

        // documentPath == "/api/[user_id]/"
        $documentPath = 'api/' . Auth::id();
        if(isset($validated['sub_path'])) {
            $documentPath = $documentPath . '/' . $validated['sub_path'];
        }

        $chunkupload = new ChunkUploadService(
            file: request()->file,
            isLastChunk: $validated['is_last_chunk'],
            documentPath: $documentPath,
            nonce: $validated['nonce'],
        );

        try {
            $path = $chunkupload->merge();

            if ($path) {
                $mergedFile = $chunkupload->getMergedFile();

                $validatedFile = Validator::make(
                    ['file' => $mergedFile],
                    ['file' => ['required', new AcceptableFileTypes, new UploadsCapacity]],
                )->validate();

                File::create([
                    'group_id' => null,
                    'user_id' => Auth::id(),
                    'title' => $validated['title'],
                    'file_type_id' => FileType::getIdFromExtension($validatedFile['file']->extension()),
                    'url' => $path,
                    'size' => $mergedFile->getSize(),
                    'uploaded_at' => Carbon::now(),
                ]);

                return response()->json([
                    'success' => true,
                    'complete' => true,
                    'message' => 'Upload successful',
                    'file_path' => $path,
                ]);
            }

            return response()->json([
                'success' => true,
                'complete' => false,
            ]);
        } catch (\Exception $e) {
            $chunkupload->deleteChunk();
            $chunkupload->deleteStorageFile();
            Log::error($e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function download(Request $request)
    {
        $request->validate([
            'file_path' => 'required|string',
        ]);

        $file = File::where('url', $request->input('file_path'))->first();

        if ($file->user_id != Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized file access',
            ], 403);
        }

        /** @var Storage $storage */
        $storage = Storage::disk('uploads');

        if (!$file || !$storage->exists($file->url)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        $url = $storage->url($file->url);
        $mimeType = $storage->mimeType($file->url);

        DownloadHistory::create([
            'user_id' => Auth::id(),
            'file_id' => $file->id,
        ]);

        $headers = [['Content-Type' => $mimeType]];
        return $storage->response($file->url, null, $headers, 'attachment');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'file_path' => 'required|string',
        ]);
        $filePath = $request->input('file_path');
        $file = File::withTrashed()->where('url', $filePath)->first();

        if ($file->user_id != Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized file access',
            ], 403);
        }

        if($file) {
            try {
                DB::transaction(function () use($request, $file) {
                    if($request->has('hard_delete')) {
                        $storage = Storage::disk('uploads');
                        if($storage->exists($file->url)) {
                            $storage->delete($file->url);
                        }

                        $file->forceDelete();
                    } else {
                        $file->delete();
                    }
                });
            } catch (\Throwable $th) {
                return response()->json([
                    'success' => false,
                    'message' => 'File deletion failed: ' . $th->getMessage(),
                ], 500);
            }
        }
        // dd($request->all());
        return response()->json([
            'success' => true,
            'message' => 'File deleted successfully',
        ]);
    }
}
