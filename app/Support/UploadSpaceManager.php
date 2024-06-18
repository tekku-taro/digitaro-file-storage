<?php
namespace App\Support;

use ByteUnits\System;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

class UploadSpaceManager
{
    public static function getCurrentStorageStatus()
    {
        $maxCapacity = \ByteUnits\parse(config('upload.max_storage_capacity'));

        return new CurrentStorageStatus($maxCapacity, \ByteUnits\parse(self::getUploadsFolderSize()));
    }

    public static function exceedMaxCapacity(UploadedFile $file)
    {
        $fileSize = $file->getSize();
        if($fileSize === false) {
            return false;
        }
        $maxCapacity = \ByteUnits\parse(config('upload.max_storage_capacity'));
        $newFolderSize = self::getUploadsFolderSize() + $fileSize;
        if($maxCapacity->isLessThan(\ByteUnits\Binary::bytes($newFolderSize))) {
            return true;
        }
        return false;
    }

    private static function getUploadsFolderSize():int
    {
        $fileSize = 0;
        $path = public_path('uploads');

        foreach( File::allFiles($path) as $file){
            $fileSize += $file->getSize();
        }

        return $fileSize;
    }
}


class CurrentStorageStatus
{
    public $capacity;
    public $usedVolume;
    public $rate;
    public $legend;

    function __construct(System $maxCapacity, System $folderSize)
    {
        $this->capacity = $maxCapacity->numberOfBytes();
        $this->usedVolume = $folderSize->numberOfBytes();
        $this->rate = ceil($this->usedVolume / $this->capacity * 100);
        // 5MiB / 10MiB (50%)
        $this->legend = $folderSize->asBinary()->format('/1') . ' / ' . $maxCapacity->asBinary()->format('/1') .' (' . $this->rate . '%)';
    }

}
