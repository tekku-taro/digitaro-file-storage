<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class File extends Model
{
    use HasFactory, SoftDeletes;

	protected $fillable = [
        'group_id',
        'user_id',
        'file_type_id',
        'title',
        'url',
        'size',
        'uploaded_at',
	];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['is_trashed','format_size'];

    /**
     * 表示用更新日
     *
     * @return  \Illuminate\Database\Eloquent\Casts\Attribute
     */
    public function isTrashed(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                return $this->trashed();
            }
        );
    }

    /**
     * 表示用更新日
     *
     * @return  \Illuminate\Database\Eloquent\Casts\Attribute
     */
    public function formatSize(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                if(!is_integer($attributes['size'])) {
                    return '';
                }
                $size = \ByteUnits\Binary::bytes($attributes['size']);
                return $size->format();
            }
        );
    }

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
