import { UploadButton } from "./upload-button";
import { FileCard } from "./file-card";
import { GridIcon, Loader2, RowsIcon } from "lucide-react";
import { SearchBar } from "./search-bar";
import { useEffect, useRef, useState } from "react";
import { DataTable } from "./file-table";
import { columns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Label } from "@/Components/ui/label";
import { router, usePage } from "@inertiajs/react";
import { PageProps, User } from "@/types";
import { FileProps } from "../interfaces/file-props";
import { FileTypeProps } from "../interfaces/file-type-props";
import { BASE_URL } from "@/app";
import { useToast } from "@/Components/ui/use-toast";

function Placeholder() {
  return (
    <div className="flex flex-col gap-8 w-full items-center mt-24">
      <img
        alt="an image of a picture and directory icon"
        width="300"
        height="300"
        src= {BASE_URL + "/images/empty.svg"}
      />
      <div className="text-2xl">You have no files, upload one now</div>
      <UploadButton />
    </div>
  );
}

export function FileBrowser({
  title,
  files,
  fileTypes,
}: {
  title: string;
  files: FileProps[];
  fileTypes: FileTypeProps[];
}) {
  const [query, setQuery] = useState("");
  const [fileTypeId, setFileTypeId] = useState();


  const isLoading = files === undefined;
  const hasBeenRendered = useRef(false);

  useEffect(() => {
    console.log(query, fileTypeId)
    if(hasBeenRendered.current) {
      router.reload({
        data: {
          file_type_id:fileTypeId,
          search:query
        }
      })
    }
    hasBeenRendered.current = true
    // return () => {
    //   second
    // }
  }, [fileTypeId, query])



  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{title}</h1>

        <SearchBar query={query} setQuery={setQuery} />

        <UploadButton />
      </div>

      <Tabs defaultValue="grid">
        <div className="flex justify-between items-center">
          <TabsList className="mb-2">
            <TabsTrigger value="grid" className="flex gap-2 items-center">
              <GridIcon />
              Grid
            </TabsTrigger>
            <TabsTrigger value="table" className="flex gap-2 items-center">
              <RowsIcon /> Table
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2 items-center">
            <Label htmlFor="type-select">Type Filter</Label>
            <Select
              value={fileTypeId}
              onValueChange={(newTypeId) => {
                setFileTypeId(newTypeId as any);
              }}
            >
              <SelectTrigger id="type-select" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {fileTypes.map(fileType => (
                  <SelectItem value={fileType.id} key={fileType.id}>{fileType.name}</SelectItem>
                ))}
                {/* <SelectItem value="all">All</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-8 w-full items-center mt-24">
            <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
            <div className="text-2xl">Loading your files...</div>
          </div>
        )}

        <TabsContent value="grid">
          <div className="grid grid-cols-3 gap-4">
            {files?.map((file) => {
              return <FileCard key={file.id} file={file} fileTypes={fileTypes} />;
            })}
          </div>
        </TabsContent>
        <TabsContent value="table">
          {/* @ts-ignore */}
          <DataTable columns={columns} data={files} />
        </TabsContent>
      </Tabs>

      {files?.length === 0 && <Placeholder />}
    </div>
  );
}
