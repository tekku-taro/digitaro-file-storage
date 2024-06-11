import { ColumnDef } from "@tanstack/react-table";
import { format, formatRelative } from "date-fns";
// import ja from 'date-fns/locale/ja'
import { ja } from 'date-fns/locale';
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { FileCardActions } from "./file-actions";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { UserCircle2Icon } from "lucide-react";
import { FileProps } from "../interfaces/file-props";
import { FileTypeProps } from "../interfaces/file-type-props";

function UserCell() {
  const { auth } = usePage<PageProps>().props
  const user = auth.user
  return (
    <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
      <UserCircle2Icon  className="w-6 h-6" />
      {user?.name}
    </div>
  );
}

export const columns: ColumnDef<FileProps>[] = [
  {
    accessorKey: "title",
    header: "タイトル",
  },
  {
    accessorKey: "file_type",
    header: "ファイル種類",
    cell: ({ row }) => {
      const fileType:FileTypeProps = row.getValue("file_type");
      return <div>{fileType.name}</div>;
    },
  },
  {
    header: "ユーザー",
    cell: ({ row }) => {
      return <UserCell />;
    },
  },
  {
    header: "アップロード日時",
    cell: ({ row }) => {
      return (
        <div>
          {/* {format(new Date(row.original.uploaded_at), 'yyyy/MM/dd HH:mm')} */}
          {formatRelative(new Date(row.original.uploaded_at), new Date(), { locale: ja })}
        </div>
      );
    },
  },
  {
    header: "アクション",
    cell: ({ row }) => {
      return (
        <div>
          <FileCardActions
            file={row.original}
            isFavorited={row.original.favorite_users_count > 0}
          />
        </div>
      );
    },
  },
];
