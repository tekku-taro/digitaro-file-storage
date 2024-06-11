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
import { isOnTrashPage, isOwnFile } from "../utils";

export function FileCardActions({
  file,
  isFavorited,
}: {
  file: FileProps;
  isFavorited: boolean;
}) {
  const { commons, auth } = usePage<PageProps>().props
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
      onSuccess: () => {
        if(onTrashPage) {
          toast({
            variant: "default",
            title: "ファイルが削除されました。",
            description: "ファイルがシステムから完全に削除されました。",
          });
        } else {
          toast({
            variant: "default",
            title: "ファイルが削除済みとして設定されました。",
            description: "削除済みファイルは復元できます。",
          });
        }

      }
      ,
      onError: () => toast({
        variant: "destructive",
        title: "問題が発生しました",
        description: "ファイルを削除できませんでした。後でもう一度お試しください。",
      })
    })
  }
  function restoreFile({fileId}:{fileId:string}) {
    const postUrl = BASE_URL + '/files/' + fileId + '/restore';
    put(postUrl, {
      preserveScroll: true,
      onSuccess: () => toast({
        variant: "success",
        title: "ファイルの復元",
        description: "ファイルが復元されました。",
      }),
      onError: () => toast({
        variant: "destructive",
        title: "問題が発生しました",
        description: "ファイルを復元できませんでした。後でもう一度お試しください。",
      })
    })
  }

  return (
    <>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に実行してもよろしいですか？</AlertDialogTitle>
            <AlertDialogDescription>
              {onTrashPage ? (
                <span>この操作はファイルを完全に削除します。ファイルはその後復元できません。</span>
              ):(
                <span>この操作により、ファイルは削除済みとして設定されます。ファイルはあとで復元可能です。</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                deleteFile({
                  fileId: file.id,
                });
              }}
            >
              実行
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
            <FileIcon className="w-4 h-4" /> ダウンロード
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
                <StarIcon className="w-4 h-4" /> お気に入り削除
              </div>
            ) : (
              <div className="flex gap-1 items-center">
                <StarHalf className="w-4 h-4" /> お気に入り追加
              </div>
            )}
          </DropdownMenuItem>
          {isOwnFile(file, auth.user) ? (
            <>
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
                    <UndoIcon className="w-4 h-4" /> ファイルの復元
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
                  <TrashIcon className="w-4 h-4" /> 削除
                </div>
              </DropdownMenuItem>
            </> ): null
          }
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
