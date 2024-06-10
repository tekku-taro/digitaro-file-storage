<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FileType extends Model
{
    use HasFactory;
    public $timestamps = false;

    protected $fillable = [
        'name',
        'mimetypes',
        'mimes',
	];

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public static function getIdFromExtension(string $extension)
    {
        $fileType = self::where('mime', $extension)->first();
        if($fileType) {
            return $fileType->id;
        }
    }
}
