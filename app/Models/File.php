<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class File extends Model
{
    use HasFactory, SoftDeletes;

	protected $fillable = [
        'user_id',
        'file_type_id',
        'title',
        'url',
        'uploaded_at',
	];

    public function fileType()
    {
        return $this->belongsTo(FileType::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function favoriteUsers()
    {
        return $this->belongsToMany(User::class, 'favorites', 'file_id', 'user_id')->withTimestamps();
    }

    public function downloadUsers()
    {
        return $this->belongsToMany(User::class, 'download_histories', 'file_id', 'user_id')->withTimestamps();
    }
}
