import { Button } from "@/Components/ui/button";
import { Link } from "@inertiajs/react";
import clsx from "clsx";
import { FileIcon, StarIcon, TrashIcon } from "lucide-react";
import { GroupProps } from "./interfaces/group-props";

export function SideNav({groups}:{groups:GroupProps[]}) {
//   console.log(groups);
  return (
    <div className="w-40 flex flex-col gap-4">
      {groups.map(group => (
        <Link href={route('files.index', {group_id:group.id})} key={group.id}>
          <Button
            variant={"link"}
            className={clsx("flex gap-2", {
              "text-blue-500": (route().params.group_id == group.id),
            })}
          >
            <FileIcon /> {group.name}
          </Button>
      </Link>
      ))}
      {/* <Link href="/dashboard/files">
        <Button
          variant={"link"}
          className={clsx("flex gap-2", {
            "text-blue-500": route().current('files.index'),
          })}
        >
          <FileIcon /> All Files
        </Button>
      </Link> */}

      <Link href="/dashboard/favorites">
        <Button
          variant={"link"}
          className={clsx("flex gap-2", {
            "text-blue-500": route().current('favorites.index'),
          })}
        >
          <StarIcon /> Favorites
        </Button>
      </Link>

      <Link href="/dashboard/trash">
        <Button
          variant={"link"}
          className={clsx("flex gap-2", {
            "text-blue-500": route().current('trash.index'),
          })}
        >
          <TrashIcon /> Trash
        </Button>
      </Link>
    </div>
  );
}
