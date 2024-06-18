<?php

namespace App\Rules;

use App\Support\UploadSpaceManager;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

class UploadsCapacity implements ValidationRule
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

        if (UploadSpaceManager::exceedMaxCapacity($value)) {
            $fail('アップロードフォルダ容量が一杯です。不要なファイルを削除してからもう一度お試しください。');
        }
    }
}
