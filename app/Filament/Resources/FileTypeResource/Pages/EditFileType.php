<?php

namespace App\Filament\Resources\FileTypeResource\Pages;

use App\Filament\Resources\FileTypeResource;
use Filament\Pages\Actions;
use Filament\Resources\Pages\EditRecord;

class EditFileType extends EditRecord
{
    protected static string $resource = FileTypeResource::class;

    protected function getActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
