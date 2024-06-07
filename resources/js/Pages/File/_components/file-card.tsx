import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { formatRelative } from "date-fns";

import { ArchiveIcon, CircleUserRound, FileSpreadsheetIcon, FileTextIcon, FileXIcon, GanttChartIcon, ImageIcon } from "lucide-react";
import { ReactElement, ReactNode, cloneElement } from "react";
import { FileCardActions } from "./file-actions";
import { FileProps } from "../interfaces/file-props";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { FileTypeProps } from "../interfaces/file-type-props";


type IconKeys = "image" | "csv" | "txt" | "zip" | "docx" | "xlsx"

const typeIcons:Record<IconKeys, ReactElement> = {
  image: <ImageIcon />,
  txt: <FileTextIcon />,
  csv: <GanttChartIcon />,
  zip: <ArchiveIcon />,
  xlsx: <FileSpreadsheetIcon />,
  docx: <FileXIcon />,
}


export function FileCard({
  file,
  fileTypes
}: {
  file: FileProps,
  fileTypes: FileTypeProps[]
}) {
  const { auth, commons } = usePage<PageProps>().props
  const user = auth.user
  const mime = file.file_type.mime;
  const absoluteUrl = commons.upload_url + file.url
  const {symbol, iconElem} = getIcons(mime)
  const lgIconElem = cloneElement(iconElem, { className: "w-20 h-20"});
  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2 text-base font-normal">
          <div className="flex justify-center">{iconElem}</div>{" "}
          {file.title}
        </CardTitle>
        <div className="absolute top-2 right-2">
          <FileCardActions isFavorited={file.favorite_users_count > 0} file={file} />
        </div>
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        {symbol === "image" && file.url && (
          <img alt={file.title} width="200" height="100" src={absoluteUrl} />
        )}

        {lgIconElem}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
          <Avatar className="w-6 h-6">
            <CircleUserRound />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {user?.name}
        </div>
        <div className="text-xs text-gray-700">
          Uploaded on {formatRelative(new Date(file.uploaded_at), new Date())}
        </div>
      </CardFooter>
    </Card>
  );
}

function getIcons( mime: string):{
  symbol:IconKeys,
  iconElem: ReactElement
} {
  switch (mime) {
    case "jpeg":
    case "jpg":
    case "png":
      return {symbol:'image' , iconElem: typeIcons['image']}
      break;
    case "txt":
    case "csv":
    case "pdf":
      return {symbol:'txt' , iconElem: typeIcons['txt']}
      break;
    case "zip":
      return {symbol:'zip' , iconElem: typeIcons['zip']}
      break;
    case "pdf":
      return {symbol:'xlsx' , iconElem: typeIcons['xlsx']}
      break;
    case "docx":
      return {symbol:'docx' , iconElem: typeIcons['docx']}
      break;
    default:
      return {symbol:'txt' , iconElem: typeIcons['txt']}
      break;
  }
}