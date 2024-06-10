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
import { isOnTrashPage } from "../utils";

export function FileCardActions({
  file,
  isFavorited,
}: {
  file: FileProps;
  isFavorited: boolean;
}) {
  const { commons } = usePage<PageProps>().props
  const absoluteUrl = commons.upload_url + file.url
  const onTrashPage = isOnTrashPage();
  const { toast } = useToast();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { put, post, delete: destroy }: InertiaFormProps<FileIdFormdataProps> = useForm<FileIdFormdataProps>({
    fileId: null,
  })



  function toggleFavorite({fileId}:{fileId:string}) {
    let postUrl;
    if(isFavorited) {
        postUrl = BASE_URL + '/unfavorite/' + fileId;
        destroy(postUrl, {
          preserveScroll: true
        })
      } else {
        postUrl = BASE_URL + '/favorite/' + fileId;
        post(postUrl, {
          preserveScroll: true
        })
    }
  }
  function deleteFile({fileId}:{fileId:string}) {
    const searchParams = new URLSearchParams();
    if(onTrashPage) {
      searchParams.set('hard_delete', '1');
    }
    const postUrl = BASE_URL + '/files/' + fileId + '?' + searchParams.toString();
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
  function restoreFile({fileId}:{fileId:string}) {
    const postUrl = BASE_URL + '/files/' + fileId + '/restore';
    put(postUrl, {
      preserveScroll: true,
      onSuccess: () => toast({
        variant: "success",
        title: "File restored",
        description: "Your file has been restored",
      }),
      onError: () => toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Your file could not be restored, try again later",
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
              {onTrashPage ? (
                <span>This action will completely delete the file. Files can not be restored afterwords.</span>
              ):(
                <span>This action will mark the file for our deletion process. Files are deleted periodically</span>
              )}
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
            {file.is_trashed && (
              <DropdownMenuItem
                onClick={() => {
                    restoreFile({
                      fileId: file.id,
                    });
                }}
                className="flex gap-1 items-center cursor-pointer"
              >
                <div className="flex gap-1 text-green-600 items-center cursor-pointer">
                  <UndoIcon className="w-4 h-4" /> Restore
                </div>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => {
                setIsConfirmOpen(true);
              }}
              className="flex gap-1 items-center cursor-pointer"
            >
              <div className="flex gap-1 text-red-600 items-center cursor-pointer">
                <TrashIcon className="w-4 h-4" /> Delete
              </div>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
