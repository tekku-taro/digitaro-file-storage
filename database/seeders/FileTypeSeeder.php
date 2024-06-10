<?php

namespace Database\Seeders;

use App\Models\FileType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FileTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        FileType::insert([
            [
                'id' => 1,
                'name' => "jpeg画像",
                'mimetype' => "image/jpeg",
                'mime' => "jpeg",
            ],
            [
                'id' => 2,
                'name' => "png画像",
                'mimetype' => "image/png",
                'mime' => "png",
            ],
            [
                'id' => 3,
                'name' => "jpg画像",
                'mimetype' => "image/jpg",
                'mime' => "jpg",
            ],
            [
                'id' => 4,
                'name' => "テキスト",
                'mimetype' => "text/plain",
                'mime' => "txt",
            ],
            [
                'id' => 5,
                'name' => "CSV",
                'mimetype' => "text/csv",
                'mime' => "csv",
            ],
            [
                'id' => 6,
                'name' => "ZIP",
                'mimetype' => "application/zip",
                'mime' => "zip",
            ],
            // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx'
            [
                'id' => 7,
                'name' => "MSワード(docx)",
                'mimetype' => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                'mime' => "docx",
            ],
            // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
            [
                'id' => 8,
                'name' => "MSエクセル(xlsx)",
                'mimetype' => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                'mime' => "xlsx",
            ],
            // 'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
            [
                'id' => 9,
                'name' => "MSパワーポイント(pptx)",
                'mimetype' => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                'mime' => "pptx",
            ],
            [
                'id' => 10,
                'name' => "PDF",
                'mimetype' => "application/pdf",
                'mime' => "pdf",
            ],
        ]);
    }
}
