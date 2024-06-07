import { ColumnDef } from "@tanstack/react-table";
import { formatRelative } from "date-fns";
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
      <Avatar className="w-6 h-6">
        <UserCircle2Icon />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      {user?.name}
    </div>
  );
}

export const columns: ColumnDef<FileProps>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "file_type",
    header: "Type",
    cell: ({ row }) => {
      const fileType:FileTypeProps = row.getValue("file_type");
      return <div>{fileType.name}</div>;
    },
  },
  {
    header: "User",
    cell: ({ row }) => {
      return <UserCell />;
    },
  },
  {
    header: "Uploaded On",
    cell: ({ row }) => {
      return (
        <div>
          {formatRelative(new Date(row.original.uploaded_at), new Date())}
        </div>
      );
    },
  },
  {
    header: "Actions",
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
