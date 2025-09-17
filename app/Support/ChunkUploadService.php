<?php
namespace App\Support;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class ChunkUploadService
{
    protected string $chunkPath;
    protected string $path;
    protected Filesystem $storage;

    public function __construct(
        public UploadedFile $file,
        private readonly bool $isLastChunk,
        private readonly string $documentPath,
        private readonly string $nonce = ''
    ) {
        $this->storage = Storage::disk('uploads');
        if (!Storage::disk('local')->exists('chunks')) {
        Storage::disk('local')->makeDirectory('chunks');
        }
        // Instead, you can create a unique hash or name and uuid to avoid the file to override.
        $tempFileName = $nonce . $file->getClientOriginalName();

        $this->chunkPath = Storage::disk('local')->path(
        "chunks/{$tempFileName}"
        );
    }

    public function getMergedFile()
    {
        if (!$this->isLastChunk) {
            return null;
        }
        $filePath = $this->storage->path($this->path);
        $mime = finfo_file(finfo_open(FILEINFO_MIME_TYPE), $filePath);
        return new UploadedFile($filePath, $this->file->getClientOriginalName(), $mime, null, true);
    }

    public function merge(): string|null
    {
        $chunkFileStream = fopen($this->file->getRealPath(), 'rb');
        $tempFileStream = fopen($this->chunkPath, 'ab');

        if ($chunkFileStream && $tempFileStream) {
            stream_copy_to_stream($chunkFileStream, $tempFileStream);

            fclose($chunkFileStream);
            fclose($tempFileStream);
        }

        if (!$this->isLastChunk) {
            return null;
        }

        // if the last chunk, store the uploaded file
        $fileName = $this->file->getClientOriginalName();
        $this->path = $this->storage->putFileAs($this->documentPath, $this->chunkPath, $fileName);

        $this->deleteChunk();

        return $this->path;
    }

    public function deleteChunk(): bool
    {
        return File::delete($this->chunkPath);
    }

    public function deleteStorageFile()
    {
        if($this->storage->exists($this->path)) {
            return $this->storage->delete($this->path);
        }
    }
}
