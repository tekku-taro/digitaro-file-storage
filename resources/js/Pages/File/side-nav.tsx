import { Button } from "@/Components/ui/button";
import { Link, usePage } from "@inertiajs/react";
import clsx from "clsx";
import { FileIcon, StarIcon, TrashIcon } from "lucide-react";
import { GroupProps } from "./interfaces/group-props";
import { PageProps } from "@/types";
import { isOnGroupPage } from "./utils";

export function SideNav({groups}:{groups:GroupProps[]}) {
  const { commons } = usePage<PageProps>().props

  const onGroupPage = isOnGroupPage()
//   const onGroupPage = !route().current('favorites.index') && !route().current('trash.index')
//   console.log(groups);
  return (
    <div className="w-fit sm:w-40 flex flex-col gap-4">
      {groups.map(group => (
        <Link href={route('files.index', {group_id:group.id})} key={group.id}>
          <Button
            variant={"link"}
            className={clsx("flex gap-2 px-2 sm:px-4", {
              "text-blue-500": (String(commons.selected_group?.id) == group.id && onGroupPage),
            })}
          >
            <FileIcon />
            <span className="hidden sm:inline">{group.name}</span>

          </Button>
      </Link>
      ))}

      <Link href={route('api_files.index')}>
        <Button
          variant={"link"}
          className={clsx("flex gap-2 px-2 sm:px-4", {
            "text-blue-500": route().current('api_files.index'),
          })}
        >
          <FileIcon />
          <span className="hidden sm:inline">API ファイル</span>
        </Button>
      </Link>

      <Link href={route('favorites.index')}>
        <Button
          variant={"link"}
          className={clsx("flex gap-2 px-2 sm:px-4", {
            "text-blue-500": route().current('favorites.index'),
          })}
        >
          <StarIcon />
          <span className="hidden sm:inline">お気に入り</span>
        </Button>
      </Link>

      <Link href={route('trash.index')}>
        <Button
          variant={"link"}
          className={clsx("flex gap-2 px-2 sm:px-4", {
            "text-blue-500": route().current('trash.index'),
          })}
        >
          <TrashIcon />
          <span className="hidden sm:inline">削除済み</span>
        </Button>
      </Link>
    </div>
  );
}
