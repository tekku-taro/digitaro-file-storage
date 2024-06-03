<?php

namespace App\Filament\Resources\FileTypeResource\Pages;

use App\Filament\Resources\FileTypeResource;
use Filament\Pages\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateFileType extends CreateRecord
{
    protected static string $resource = FileTypeResource::class;
}
