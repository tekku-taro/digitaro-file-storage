import { User } from "@/types";
import { FileProps } from "../interfaces/file-props";

export function isOnGroupPage():boolean {
    return !route().current('favorites.index') && !route().current('trash.index');
}

export function isOnTrashPage():boolean {
    return route().current('trash.index');
}

export function isOwnFile(file:FileProps, user:User):boolean {

    return file.user_id == user.id || user.is_admin;
}
