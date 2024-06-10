export function isOnGroupPage():boolean {
    return !route().current('favorites.index') && !route().current('trash.index');
}

export function isOnTrashPage():boolean {
    return route().current('trash.index');
}
