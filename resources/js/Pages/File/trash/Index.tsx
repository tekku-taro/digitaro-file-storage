import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { SideNav } from '../side-nav';
import { GroupProps } from '../interfaces/group-props';
import { FileBrowser } from '../_components/file-browser';
import { FileProps } from '../interfaces/file-props';
import { FileTypeProps } from '../interfaces/file-type-props';

export default function TrashIndex({ auth, groups, files, fileTypes}: PageProps & {
    groups:GroupProps[],
    files:FileProps[],
    fileTypes: FileTypeProps[],
}) {
    console.log(files)
    console.log(fileTypes)
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
                          title={'削除済みファイル一覧'}
                          files={files}
                          fileTypes={fileTypes}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
