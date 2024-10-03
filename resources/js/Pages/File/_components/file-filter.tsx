import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Label } from "@/Components/ui/label";
import { FileTypeProps } from "../interfaces/file-type-props";

function FileFilter({fileTypeId, setFileTypeId, fileTypes}:{
  fileTypeId:string|undefined,
  setFileTypeId:React.Dispatch<React.SetStateAction<string|undefined>>
  fileTypes: FileTypeProps[];
}) {
  return (
    <div className="flex gap-2 items-center">
      <Label htmlFor="type-select" className="hidden sm:inline">ファイル種類</Label>
      <Select
        value={fileTypeId}
        onValueChange={(newTypeId) => {
          setFileTypeId(newTypeId as any);
        }}
      >
        <SelectTrigger id="type-select" className="w-[180px]">
          <SelectValue placeholder="絞込" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {fileTypes.map(fileType => (
            <SelectItem value={fileType.id} key={fileType.id}>{fileType.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default FileFilter
