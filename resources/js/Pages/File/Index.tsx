import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { SideNav } from './side-nav';
import { GroupProps } from './interfaces/group-props';
import { FileBrowser } from './_components/file-browser';
import { FileProps } from './interfaces/file-props';
import { FileTypeProps } from './interfaces/file-type-props';

export default function Dashboard({ auth, groups, files, fileTypes}: PageProps & {
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
            <main className="container mx-auto pt-2 sm:pt-12 min-h-screen">
                <div className="flex gap-1 sm:gap-8">
                    <SideNav groups={groups} />

                    <div className="w-full">
                        <FileBrowser
                          title="Your Files"
                          files={files}
                          fileTypes={fileTypes}
                        />
                    </div>
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
