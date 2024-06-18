<?php

namespace App\Rules;

use App\Models\FileType;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

class AcceptableFileTypes implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if(! $value instanceof UploadedFile) {
            return;
        }

        $mimeTypes = FileType::pluck('mime')->toArray();

        if (!in_array($value->extension(), $mimeTypes)) {
            $fail('アップロードできるファイルの種類は（' .implode(',', $mimeTypes).'）のみです。');
        }
    }
}
