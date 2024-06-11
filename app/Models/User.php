<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use Filament\Models\Contracts\FilamentUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'is_admin',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function canAccessFilament(): bool
    {
        return $this->is_admin;
    }



    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function favoriteFiles()
    {
        return $this->belongsToMany(File::class, 'favorites', 'user_id', 'file_id')->withTimestamps();
    }

    public function downloadedFiles()
    {
        return $this->belongsToMany(File::class, 'download_histories', 'user_id', 'file_id')->withTimestamps();
    }

    public function userGroups()
    {
        return $this->belongsToMany(Group::class, 'group_user', 'user_id', 'group_id')->withTimestamps();
    }


    public function favoriteFile($fileId)
    {
        $exists = $this->isFavoriteFile($fileId);

        if (!$exists) {
            $this->favoriteFiles()->attach($fileId);
            return true;
        } else {
            return false;
        }
    }

    public function unfavoriteFile($fileId)
    {
        $exists = $this->isFavoriteFile($fileId);

        if ($exists) {
            $this->favoriteFiles()->detach($fileId);
            return true;
        } else {
            return false;
        }
    }

    public function isFavoriteFile($fileId)
    {
        return $this->favoriteFiles()->where('file_id', $fileId)->exists();
    }

    public function attachGroup($groupId)
    {
        $exists = $this->isUserGroup($groupId);

        if (!$exists) {
            $this->userGroups()->attach($groupId);
            return true;
        } else {
            return false;
        }
    }

    public function detachGroup($groupId)
    {
        $exists = $this->isUserGroup($groupId);

        if ($exists) {
            $this->userGroups()->detach($groupId);
            return true;
        } else {
            return false;
        }
    }

    public function isUserGroup($groupId)
    {
        return $this->userGroups()->where('group_id', $groupId)->exists();
    }

}
