import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
  FileIcon,
  MoreVertical,
  StarHalf,
  StarIcon,
  TrashIcon,
  UndoIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/Components/ui/use-toast";
import { FileProps } from "../interfaces/file-props";
import { useForm, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { InertiaFormProps } from "@/types/inertia-form";
import {  FileIdFormdataProps } from "../interfaces/formdata-props";
import { BASE_URL } from "@/app";

export function FileCardActions({
  file,
  isFavorited,
}: {
  file: FileProps;
  isFavorited: boolean;
}) {
  const { commons } = usePage<PageProps>().props
  const absoluteUrl = commons.upload_url + file.url

  const { toast } = useToast();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { data, setData, put, delete: destroy, progress }: InertiaFormProps<FileIdFormdataProps> = useForm<FileIdFormdataProps>({
    fileId: null,
  })



  function toggleFavorite({fileId}:{fileId:string}) {
    let postUrl;
    if(isFavorited) {
        postUrl = BASE_URL + '/unfavorites/' + fileId;
      } else {
        postUrl = BASE_URL + '/unfavorites/' + fileId;
    }

    setData('fileId', fileId)

    put(postUrl, {
      preserveScroll: true
    })
  }
  function deleteFile({fileId}:{fileId:string}) {
    const postUrl = BASE_URL + '/files/' + fileId + '/destroy';

    setData('fileId', fileId)

    destroy(postUrl, {
      preserveScroll: true,
      onSuccess: () => toast({
        variant: "default",
        title: "File marked for deletion",
        description: "Your file will be deleted soon",
      }),
      onError: () => toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Your file could not be deleted, try again later",
      })
    })
  }

  return (
    <>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the file for our deletion process. Files are
              deleted periodically
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                deleteFile({
                  fileId: file.id,
                });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              if (!file.url) return;
              window.open(absoluteUrl, "_blank");
            }}
            className="flex gap-1 items-center cursor-pointer"
          >
            <FileIcon className="w-4 h-4" /> Download
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              toggleFavorite({
                fileId: file.id,
              });
            }}
            className="flex gap-1 items-center cursor-pointer"
          >
            {isFavorited ? (
              <div className="flex gap-1 items-center">
                <StarIcon className="w-4 h-4" /> Unfavorite
              </div>
            ) : (
              <div className="flex gap-1 items-center">
                <StarHalf className="w-4 h-4" /> Favorite
              </div>
            )}
          </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (file.is_trashed) {
                //   restoreFile({
                //     fileId: file._id,
                //   });
                } else {
                  setIsConfirmOpen(true);
                }
              }}
              className="flex gap-1 items-center cursor-pointer"
            >
              {file.is_trashed ? (
                <div className="flex gap-1 text-green-600 items-center cursor-pointer">
                  <UndoIcon className="w-4 h-4" /> Restore
                </div>
              ) : (
                <div className="flex gap-1 text-red-600 items-center cursor-pointer">
                  <TrashIcon className="w-4 h-4" /> Delete
                </div>
              )}
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
