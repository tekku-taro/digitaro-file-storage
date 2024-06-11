export interface User {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    email_verified_at: string;
}
export interface Group {
    id: number;
    name: string;
    notes: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    commons: {
        upload_url: string;
        selected_group: Group|null;
    };
};
