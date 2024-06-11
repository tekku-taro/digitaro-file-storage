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
    <div className="w-40 flex flex-col gap-4">
      {groups.map(group => (
        <Link href={route('files.index', {group_id:group.id})} key={group.id}>
          <Button
            variant={"link"}
            className={clsx("flex gap-2", {
              "text-blue-500": (String(commons.selected_group?.id) == group.id && onGroupPage),
            })}
          >
            <FileIcon /> {group.name}
          </Button>
      </Link>
      ))}

      <Link href={route('favorites.index')}>
        <Button
          variant={"link"}
          className={clsx("flex gap-2", {
            "text-blue-500": route().current('favorites.index'),
          })}
        >
          <StarIcon /> お気に入り
        </Button>
      </Link>

      <Link href={route('trash.index')}>
        <Button
          variant={"link"}
          className={clsx("flex gap-2", {
            "text-blue-500": route().current('trash.index'),
          })}
        >
          <TrashIcon /> 削除済み
        </Button>
      </Link>
    </div>
  );
}
