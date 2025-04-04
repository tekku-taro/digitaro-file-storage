<?php

namespace App\Http\Controllers;

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
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class FilesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = File::query();

        if($request->has('group_id')) {
            $query->where('group_id', $request->group_id);
        } else {
            $query->where('group_id', Auth::user()->userGroups->first()?->id);
        }
        if($request->has('file_type_id') && $request->file_type_id != 'all') {
            $query->where('file_type_id', $request->file_type_id);
        }
        if($request->has('search')) {
            $query->where('title', 'LIKE', '%' . $request->search . '%');
        }
        $files = $query->with(['fileType', 'user'])->withCount(['favoriteUsers' => function($query) {
            $query->where('user_id', Auth::id());
        }])->get();

        return Inertia::render('File/files/Index', [
            'files' => $files,
            'fileTypes' => FileType::all(),
            'groups' => Auth::user()->userGroups,
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function apiFiles(Request $request)
    {
        $query = File::query();

        $query->where('user_id', Auth::id())
            ->whereNull('group_id');

        if($request->has('file_type_id') && $request->file_type_id != 'all') {
            $query->where('file_type_id', $request->file_type_id);
        }

        if($request->has('search')) {
            $query->where('title', 'LIKE', '%' . $request->search . '%');
        }

        $files = $query->with(['fileType', 'user'])->get();

        return Inertia::render('File/api_files/Index', [
            'files' => $files,
            'fileTypes' => FileType::all(),
            'groups' => Auth::user()->userGroups,
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function favorites(Request $request)
    {
        $query = File::query();

        $query->whereHas('favoriteUsers', function($query) {
            $query->where('user_id', Auth::id());
        });

        if($request->has('file_type_id') && $request->file_type_id != 'all') {
            $query->where('file_type_id', $request->file_type_id);
        }

        if($request->has('search')) {
            $query->where('title', 'LIKE', '%' . $request->search . '%');
        }
        $files = $query->with(['fileType', 'user'])->withCount(['favoriteUsers' => function($query) {
            $query->where('user_id', Auth::id());
        }])->get();

        return Inertia::render('File/favorites/Index', [
            'files' => $files,
            'fileTypes' => FileType::all(),
            'groups' => Auth::user()->userGroups,
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function trash(Request $request)
    {
        $query = File::query();
        if(!Auth::user()->is_admin) {
            $query->where('user_id', Auth::id());
        }

        $query->onlyTrashed();

        if($request->has('file_type_id') && $request->file_type_id != 'all') {
            $query->where('file_type_id', $request->file_type_id);
        }

        if($request->has('search')) {
            $query->where('title', 'LIKE', '%' . $request->search . '%');
        }
        $files = $query->with(['fileType', 'user'])->withCount(['favoriteUsers' => function($query) {
            $query->where('user_id', Auth::id());
        }])->get();

        return Inertia::render('File/trash/Index', [
            'files' => $files,
            'fileTypes' => FileType::all(),
            'groups' => Auth::user()->userGroups,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function upload(Request $request)
    {
        // dd($request->all());
        $validated = $request->validate([
            'is_last_chunk' => ['required', 'boolean'],
            'group_id' => 'required|integer|exists:groups,id',
            'title' => 'required',
        ]);
        $group = Group::find($validated['group_id']);

        $chunkupload = new ChunkUploadService(
            file: request()->file,
            isLastChunk: $validated['is_last_chunk'],
            documentPath: $group->name,
            nonce: $request->session()->token()
        );

        try {
            $path = $chunkupload->merge();

            if ($path) {
                $mergedFile = $chunkupload->getMergedFile();

                $validatedFile = Validator::make(
                    ['file' => $mergedFile],
                    ['file' => ['required', new AcceptableFileTypes, new UploadsCapacity]],
                    [
                        'group_id' => 'ファイルアップロードはグループのファイル一覧画面で実行してください。',
                    ]
                )->validate();

                File::create([
                    'group_id' => $validated['group_id'],
                    'user_id' => Auth::id(),
                    'title' => $validated['title'],
                    'file_type_id' => FileType::getIdFromExtension($validatedFile['file']->extension()),
                    'url' => $path,
                    'size' => $mergedFile->getSize(),
                    'uploaded_at' => Carbon::now(),
                ]);

                return response()->json([
                'complete' => true,
                ]);
            }

            return response()->json([
                'complete' => false,
            ]);
        } catch (\Exception $e) {
            $chunkupload->deleteChunk();
            $chunkupload->deleteStorageFile();
            throw $e;
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function download(Request $request, $id)
    {
        $file = File::findOrFail($id);
        $storage = Storage::disk('uploads');
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
    public function destroy(Request $request, string $id)
    {
        // TODO 完全削除ができない問題あり
        try {
            DB::transaction(function () {

            });
        } catch (\Throwable $th) {
            return response()->json([
                'result' => 'failure',
                'message' => $th->getMessage(),
            ]);
        }
        // dd($request->all());
        $file = File::withTrashed()->findOrFail($id);

        if($request->has('hard_delete')) {
            $storage = Storage::disk('uploads');
            if($storage->exists($file->url)) {
                $storage->delete($file->url);
            }

            $file->forceDelete();
        } else {
            $file->delete();
        }

        return back();
    }

    /**
     * Restore the specified resource.
     */
    public function restore(string $id)
    {
        try {
            DB::transaction(function () {

            });
        } catch (\Throwable $th) {
            return response()->json([
                'result' => 'failure',
                'message' => $th->getMessage(),
            ]);
        }
        // dd($request->all());
        $file = File::withTrashed()->findOrFail($id);

        $file->restore();

        return back();
    }
}
