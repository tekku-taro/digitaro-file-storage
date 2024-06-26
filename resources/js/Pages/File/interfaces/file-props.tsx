import { User } from "@/types";
import { FileTypeProps } from "./file-type-props";

export interface FileProps {
    id:string;
    group_id:number;
    user_id:number;
    file_type_id:number;
    file_type:FileTypeProps;
    title:string;
    url:string;
    format_size:number;
    uploaded_at:string;
    favorite_users_count:number;
    is_trashed:boolean;
    user:User;
}
