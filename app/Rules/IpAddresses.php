<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class IpAddresses implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $ipaddresses = explode(',', $value);
        foreach ($ipaddresses as $ipaddress) {
            $trimmed = trim($ipaddress);
            if(!filter_var($trimmed, FILTER_VALIDATE_IP) && $trimmed != 'localhost') {
                $fail('有効なIPアドレスではありません。');
            }
        }
    }
}
