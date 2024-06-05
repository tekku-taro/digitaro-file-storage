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
        } else if($request->has('favorite_list')) {
            $query->whereHas('favoriteUsers', function($query) {
                $query->where('id', Auth::id());
            });
        } else if($request->has('delete_list')) {
            $query->onlyTrashed();
        }

        if($request->has('file_type_id')) {
            $query->where('file_type_id', $request->file_type_id);
        }

        if($request->has('search')) {
            $query->where('title', $request->search);
        }
        $files = $query->get();

        return Inertia::render('Files.Index', [
            'files' => $files
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function upload(Request $request)
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

        $mimeTypes = FileType::pluck('mime')->toArray();
        // dd($request->all());
        $validated = $request->validate([
            'group_id' => 'required|integer|exists:groups,id',
            'file_type_id' => 'required',
            'title' => 'required',
            'file' => ['required', RulesFile::types($mimeTypes)],
        ],['file' => 'アップロードできるファイルの種類は（' .implode(',', $mimeTypes).'）のみです。']);

        $group = Group::find($validated['group_id']);
        $uploadedFile = $request->file('file');
        $fileName = $uploadedFile->getClientOriginalName();
        $storage = Storage::disk('file');
        $path = $storage->putFileAs($group->name, $uploadedFile, $fileName);


        File::create([
            'group_id' => $validated['group_id'],
            'user_id' => Auth::id(),
            'title' => $validated['title'],
            'file_type_id' => $validated['file_type_id'],
            'url' => $path,
            'uploaded_at' => Carbon::now(),
        ]);

        return response()->json(['result' => 'success']);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function download(Request $request, $id)
    {
        $file = File::findOrFail($id);
        $storage = Storage::disk('file');
        $url = $storage->url($file->url);
        $mimeType = $storage->mimeType($file->url);

        DownloadHistory::create([
            'user_id' => Auth::id(),
            'file_id' => $file->id,
        ]);

        $headers = [['Content-Type' => $mimeType]];
        return $storage->response($file->url, null, $headers, 'attachment');
        // return Storage::response($file->url, null, $headers, 'attachment');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
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
        $file = File::findOrFail($id);

        if($request->has('hard_delete')) {
            $storage = Storage::disk('file');
            if($storage->exists($file->url)) {
                $storage->delete($file->url);
            }

            $file->forceDelete();
        } else {
            $file->delete();
        }


        return response()->json(['result' => 'success']);
    }
}
