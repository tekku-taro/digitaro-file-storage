<?php

namespace App\Filament\Resources\FileTypeResource\Pages;

use App\Filament\Resources\FileTypeResource;
use Filament\Pages\Actions;
use Filament\Resources\Pages\ListRecords;

class ListFileTypes extends ListRecords
{
    protected static string $resource = FileTypeResource::class;

    protected function getActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
