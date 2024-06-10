<?php

namespace App\Http\Controllers;

use App\Models\DownloadHistory;
use App\Models\File;
use App\Models\FileType;
use App\Models\Group;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File as RulesFile;
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
        }
        if($request->has('file_type_id') && $request->file_type_id != 'all') {
            $query->where('file_type_id', $request->file_type_id);
        }
        if($request->has('search')) {
            $query->where('title', 'LIKE', '%' . $request->search . '%');
        }
        $files = $query->with(['fileType'])->withCount(['favoriteUsers' => function($query) {
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
        $files = $query->with(['fileType'])->withCount(['favoriteUsers' => function($query) {
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

        $query->onlyTrashed();

        if($request->has('file_type_id') && $request->file_type_id != 'all') {
            $query->where('file_type_id', $request->file_type_id);
        }

        if($request->has('search')) {
            $query->where('title', 'LIKE', '%' . $request->search . '%');
        }
        $files = $query->with(['fileType'])->withCount(['favoriteUsers' => function($query) {
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
        try {
            DB::transaction(function () {

            });
        } catch (\Throwable $th) {
            return response()->json([
                'result' => 'failure',
                'message' => $th->getMessage(),
            ]);
        }

        $mimeTypes = FileType::pluck('mime')->toArray();
        // dd($request->all());
        $validated = $request->validate([
            'group_id' => 'required|integer|exists:groups,id',
            'title' => 'required',
            'file' => ['required', RulesFile::types($mimeTypes)],
        ],
            [
                'file' => 'アップロードできるファイルの種類は（' .implode(',', $mimeTypes).'）のみです。',
                'group_id' => 'ファイルアップロードはグループのファイル一覧画面で実行してください。'
            ]
        );

        $group = Group::find($validated['group_id']);
        $uploadedFile = $request->file('file');
        $fileName = $uploadedFile->getClientOriginalName();
        $storage = Storage::disk('uploads');
        $path = $storage->putFileAs($group->name, $uploadedFile, $fileName);


        File::create([
            'group_id' => $validated['group_id'],
            'user_id' => Auth::id(),
            'title' => $validated['title'],
            'file_type_id' => FileType::getIdFromExtension($uploadedFile->extension()),
            'url' => $path,
            'uploaded_at' => Carbon::now(),
        ]);

        return back();
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
