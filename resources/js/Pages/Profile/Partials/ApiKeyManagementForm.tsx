import { useState, useEffect, FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';

import { useToast } from '@/Components/ui/use-toast';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

interface ApiKey {
    id: number;
    name: string;
    token: string;
    allowed_ips: string;
    created_at: string;
}

export default function ApiKeyManagementForm({ className = '' }: { className?: string }) {
    const { toast } = useToast();
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [refreshKeys, setRefreshKeys] = useState(false);
    const [showTokenDialog, setShowTokenDialog] = useState(false);
    const [newToken, setNewToken] = useState('');

    const { data, setData, processing, errors, reset } = useForm({
        name: '',
        allowed_ips: '',
    });

    useEffect(() => {
        // Fetch API keys when component mounts or when refreshKeys changes
        const fetchApiKeys = async () => {
            try {
                const response = await fetch(route('api.keys.index'));
                if (response.ok) {
                    const data = await response.json();
                    setApiKeys(data);
                }
            } catch (error) {
                console.error('Failed to fetch API keys:', error);
            }
        };

        fetchApiKeys();
    }, [refreshKeys]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                // Optional: Show a success message
                toast({
                    variant: "default",
                    // title: "",
                    description: "APIキーがクリップボードにコピーされました。",
                  });
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                toast({
                    variant: "destructive",
                    title: "問題が発生しました",
                    description: "APIキーをクリップボードにコピーできませんでした。後でもう一度お試しください。",
                })
            });
    };

    const deleteApiKey = async (id: number) => {
        if (confirm('このAPIキーを削除してもよろしいですか？')) {
            try {
                const response = await fetch(route('api.keys.destroy', id), {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });

                if (response.ok) {
                    setRefreshKeys(!refreshKeys); // Trigger a refresh
                } else {
                    const responseBody = await response.json();
                    toast({
                        variant: "destructive",
                        title: "問題が発生しました",
                        description: responseBody.message + "後でもう一度お試しください。",
                    })
                }
            } catch (error) {
                console.error('Failed to delete API key:', error);
                toast({
                    variant: "destructive",
                    title: "問題が発生しました",
                    description: "APIキーを削除できませんでした。後でもう一度お試しください。",
                })
            }
        }
    };

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(route('api.keys.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data),
            });

            const responseBody = await response.json();
            console.log(responseBody);
            if (response.ok) {
                setNewToken(responseBody.token);
                setShowTokenDialog(true);
                reset();
                setRefreshKeys(!refreshKeys); // Trigger a refresh
            } else {
                let errorMessage = "入力内容をご確認ください。";
                if (responseBody?.errors) {
                    // Extract error messages from the errors object
                    const errorMessages = Object.values(responseBody.errors).flat();
                    errorMessage = errorMessages.join(" "); // Join messages with a space
                }
                toast({
                    variant: "destructive",
                    title: "バリデーションエラー",
                    description: errorMessage,
                })
            }
        } catch (error) {
            console.error('Failed to create API key:', error);
            toast({
                variant: "destructive",
                title: "問題が発生しました",
                description: "APIキーを生成できませんでした。後でもう一度お試しください。",
            })
        }
    };

    const closeTokenDialog = () => {
        setShowTokenDialog(false);
        setNewToken('');
    };

    const truncateText = (text: string, maxLength: number) => {
        if (text.length > maxLength) {
            return text.slice(0, maxLength) + ' ... ';
        }
        return text;
    };


    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">API KEY の管理</h2>
                <p className="mt-1 text-sm text-gray-600">
                    ファイル管理APIで使用するAPIキーを作成・管理できます
                </p>
            </header>

            <div className="mt-6 w-full">
                {apiKeys.length > 0 ? (
                    <div className="mb-6">
                        {apiKeys.map((key) => (
                            <div key={key.id} className="flex items-center mb-2 pb-2 w-full">
                                <div className="w-1/5 mr-2">
                                    <span className="text-sm font-medium">{key.name}</span>
                                </div>
                                <div className="flex-1 mr-4">
                                    <span className="text-md text-gray-800">
                                        許可IP:{'　'} {key.allowed_ips || '制限なし'}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => deleteApiKey(key.id)}
                                    className="px-4 py-2 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                                >
                                    削除
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mb-6 text-sm text-gray-600">APIキーはまだ作成されていません</p>
                )}

                <div className="border-t pt-4">
                    <h3 className="text-md font-medium mb-4">API KEY の発行</h3>
                    <form onSubmit={submit} className="flex items-end gap-2">
                        <div className="w-1/4">
                            <InputLabel htmlFor="name" value="API名" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div className="flex-1 mr-4">
                            <InputLabel htmlFor="allowed_ips" value="許可IPアドレス（,で区切る）" />
                            <TextInput
                                id="allowed_ips"
                                className="mt-1 block w-full"
                                value={data.allowed_ips}
                                onChange={(e) => setData('allowed_ips', e.target.value)}
                                placeholder="192.168.1.1,10.0.0.1"
                            />
                            <InputError message={errors.allowed_ips} className="mt-1" />
                        </div>

                        <PrimaryButton disabled={processing} className="bg-black text-white mt-[-30px]">
                            生成する
                        </PrimaryButton>
                    </form>
                </div>
            </div>

            {/* Token creation success dialog */}
            {(showTokenDialog ) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">APIキーが生成されました</h3>
                        <p className="text-sm text-gray-600 mb-2">
                            このAPIキーは一度しか表示されません。安全な場所に保存してください。
                        </p>
                        <div className="flex items-center mb-8">
                            <TextInput
                                className="flex-1 w-3 bg-gray-100"
                                value={newToken}
                                readOnly
                            />
                            <button
                                type="button"
                                onClick={() => copyToClipboard(newToken)}
                                className="ml-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                            >
                                コピー
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={closeTokenDialog}
                                className="px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </section>
    );
}
