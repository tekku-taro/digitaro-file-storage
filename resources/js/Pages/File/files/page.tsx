import { PageProps } from "@/types";
import { FileBrowser } from "../_components/file-browser";
import { GroupProps } from "../interfaces/group-props";
import { FileProps } from "../interfaces/file-props";
import { FileTypeProps } from "../interfaces/file-type-props";

export default function FilesPage({ auth, groups, files, fileTypes}: PageProps & {
  groups:GroupProps[],
  files:FileProps[],
  fileTypes: FileTypeProps[],
}) {
  return (
    <div>
      <FileBrowser
        title="Your Files"
        files={files}
        fileTypes={fileTypes}
      />
    </div>
  );
}
