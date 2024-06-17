import { Button } from "@/Components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Components/ui/form";
import { Input } from "@/Components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useToast } from "@/Components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { BASE_URL } from "@/app";
import { usePage, router } from "@inertiajs/react";
import { useForm } from "react-hook-form";
import { PageProps } from "@/types";
import { isOnGroupPage } from "../utils";
import axios from "axios";

const formSchema = z.object({
  title: z.string().min(1, "1文字以上で入力してください").max(200, "200文字以下で入力してください"),
  group_id:z.number(),
  file: z
    .custom<FileList>((val) => val instanceof FileList, "ファイルを選択して下さい")
    .refine((files) => files.length > 0, `ファイルを選択して下さい`),
});


export function UploadButton() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const { commons } = usePage<PageProps>().props;
  const [progress, setProgress] = useState({percentage:0})
  const [errors, setErrors] = useState({title:null, file:null})
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      group_id:commons.selected_group? commons.selected_group.id:undefined,
      file: undefined,
    },
  });

  const fileRef = form.register("file");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // サイズの大きいファイルに対応
    const postUrl = BASE_URL + '/files/upload';
    const file = values.file[0];
    try {
      setIsSubmitting(true)
      setProgress({percentage:1})
      const uploadSize = import.meta.env.VITE_CHUNK_UPLOAD_SIZE;
      const chunkSize = uploadSize ? parseInt(uploadSize): 1024  * 1024 * 4;
      const chunks = Math.ceil(file.size / chunkSize);
      for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('file', chunk, file.name);
        formData.append('title', values.title);
        formData.append('group_id', String(values.group_id));
        formData.append('is_last_chunk', i === (chunks - 1) ? '1' : '0');
        await axios.post(postUrl, formData);
        setProgress((progress) => ({
          percentage: progress.percentage + chunkSize/ file.size * 100
        }))

      }
      router.reload();
      toast({
        variant: "success",
        title: "アップロード完了",
        description: "ファイルがアップロードされました。",
      })
      setIsFileDialogOpen(false);

    } catch (err) {
      console.log(err)
      if (axios.isAxiosError(err) && err.response)  {
        setErrors(err.response.data.errors)
        // Access to config, request, and response
      }
      router.reload();
      toast({
        variant: "destructive",
        title: "問題が発生しました",
        description: "ファイルをアップロードできませんでした。後でもう一度お試しください。",
      })
      setIsSubmitting(false)
    }
  }

  function onChangeFile(e:React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files ? e.target.files[0]:null;
    form.setValue('title', file?.name ?? '')
  }

  function clearErrors() {
    form.clearErrors()
    setErrors({title:null, file:null})
  }

  return (
    <Dialog
      open={isFileDialogOpen}
      onOpenChange={(isOpen) => {
        form.reset()
        clearErrors()
        setIsFileDialogOpen(isOpen);
        setIsSubmitting(false)
        setProgress({percentage:0})
      }}
    >
      <DialogTrigger asChild>
        <Button
          disabled={!isOnGroupPage()}
        >ファイルのアップロード</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-8">アップロードダイアログ</DialogTitle>
          <DialogDescription>
            このファイルは同じグループの他のメンバーならば誰でもアクセスできます。
            {/* This file will be accessible by anyone in your Group */}
          </DialogDescription>
        </DialogHeader>

        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイトル</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    {errors.title && <div className="text-red-700">{errors.title}</div>}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="file"
                render={() => (
                  <FormItem>
                    <FormLabel>ファイル</FormLabel>
                    <FormControl>
                      <Input type="file" {...fileRef}  onChange={e => {
                          onChangeFile(e)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {errors.file && <div className="text-red-700">{errors.file}</div>}
                  </FormItem>
                )}
              />
              {progress.percentage > 0 ? (
                <progress className="w-full" value={progress.percentage} max="100">
                  {progress.percentage}%
                </progress>
              ) : ''}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex gap-1"
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                送信
              </Button>
            </form>
          </Form>

        </div>
      </DialogContent>
    </Dialog>
  );
}

