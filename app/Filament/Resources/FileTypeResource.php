<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FileTypeResource\Pages;
use App\Filament\Resources\FileTypeResource\RelationManagers;
use App\Models\FileType;
use Filament\Forms;
use Filament\Resources\Form;
use Filament\Resources\Resource;
use Filament\Resources\Table;
use Filament\Tables;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class FileTypeResource extends Resource
{
    protected static ?string $model = FileType::class;

    protected static ?string $navigationIcon = 'heroicon-o-collection';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required(),
                Forms\Components\TextInput::make('mimetype')
                    ->required(),
                Forms\Components\TextInput::make('mime'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name'),
                Tables\Columns\TextColumn::make('mimetype'),
                Tables\Columns\TextColumn::make('mime'),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ]);
    }
    
    public static function getRelations(): array
    {
        return [
            //
        ];
    }
    
    public static function getPages(): array
    {
        return [
            'index' => Pages\ListFileTypes::route('/'),
            'create' => Pages\CreateFileType::route('/create'),
            'edit' => Pages\EditFileType::route('/{record}/edit'),
        ];
    }    
}
