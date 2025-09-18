import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { SideNav } from '../side-nav';
import { GroupProps } from '../interfaces/group-props';
import { FileBrowser } from '../_components/file-browser';
import { FileProps } from '../interfaces/file-props';
import { FileTypeProps } from '../interfaces/file-type-props';
import { Button } from '@/Components/ui/button';
import { toast } from '@/Components/ui/use-toast';
import { InertiaFormProps } from '@/types/inertia-form';
import { BASE_URL } from '@/app';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/Components/ui/alert-dialog"

export default function TrashIndex({ auth, groups, files, fileTypes}: PageProps & {
    groups:GroupProps[],
    files:FileProps[],
    fileTypes: FileTypeProps[],
}) {
    console.log(files)
    console.log(fileTypes)

    const { delete: destroy }: InertiaFormProps<{}> = useForm({})

    const handleDeleteAll = () => {
        const searchParams = new URLSearchParams(window.location.search);

        const postUrl = BASE_URL + '/files/destroy_all?' + searchParams.toString();
        destroy(postUrl, {
        preserveScroll: true,
        onSuccess: () => {
            toast({
                variant: "default",
                title: "削除済みファイルを全て削除しました。",
                description: "削除済みファイルがすべてシステムから完全に削除されました。",
            });
        }
        ,
        onError: () => toast({
            variant: "destructive",
            title: "問題が発生しました",
            description: "ファイルを削除できませんでした。後でもう一度お試しください。",
        })
        })
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />
            <div className="container mx-auto pt-8 sm:pt-12 min-h-screen px-1 sm:px-8">
                <div className="flex gap-2 sm:gap-8">
                    <SideNav groups={groups} />

                    <div className="w-full">
                        <FileBrowser
                          title={<>
                            <span>削除済みファイル一覧</span>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="ml-4 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                    >全削除
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>ゴミ箱内のファイルを全て完全に削除します。よろしいですか？</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        この操作は元に戻せません。これにより、ファイルがサーバーから完全に削除されます。
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAll}>続行</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                          </>

                          }
                          files={files}
                          fileTypes={fileTypes}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
