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
import { useRef, useState } from "react";
import { useToast } from "@/Components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { BASE_URL } from "@/app";
import { useForm as useInertiaForm, usePage } from "@inertiajs/react";
import { useForm } from "react-hook-form";
import { UploadFormdataProps } from "../interfaces/upload-formdata-props";
import { InertiaFormProps } from "@/types/inertia-form";
import { PageProps } from "@/types";
import { isOnGroupPage } from "../utils";

const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList, "Required")
    .refine((files) => files.length > 0, `Required`),
});


export function UploadButton() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const { commons } = usePage<PageProps>().props;
  const { data, setData, post, progress, reset, errors }: InertiaFormProps<UploadFormdataProps> = useInertiaForm<UploadFormdataProps>({
    group_id:commons.selected_group? commons.selected_group.id:null,
    title: "",
    file: null,
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  const fileRef = form.register("file");

  function onSubmit(values: z.infer<typeof formSchema>) {
    const postUrl = BASE_URL + '/files/upload';
    try {
      post(postUrl, {
        onStart: () => setIsSubmitting(true),
        preserveScroll: true,
        onSuccess: () => {
          toast({
            variant: "success",
            title: "File Uploaded",
            description: "Now everyone can view your file",
          })
          setIsFileDialogOpen(false);
        },
        onError: () => toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Your file could not be uploaded, try again later",
        })
      })


    } catch (err) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Your file could not be uploaded, try again later",
      });
    }
  }

  function onChangeFile(e:React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files ? e.target.files[0]:null;
    setData('file', file);
    form.setValue('title', file?.name ?? '')
  }

  return (
    <Dialog
      open={isFileDialogOpen}
      onOpenChange={(isOpen) => {
        reset()
        setIsFileDialogOpen(isOpen);
        setIsSubmitting(false)
      }}
    >
      <DialogTrigger asChild>
        <Button
          disabled={!isOnGroupPage()}
        >Upload File</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-8">Upload your File Here</DialogTitle>
          <DialogDescription>
            This file will be accessible by anyone in your Group
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
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} onBlur={e => setData('title', e.target.value)} />
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
                    <FormLabel>File</FormLabel>
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
              {progress && (
                <progress value={progress.percentage} max="100">
                  {progress.percentage}%
                </progress>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex gap-1"
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Submit
              </Button>
            </form>
          </Form>

        </div>
      </DialogContent>
    </Dialog>
  );
}

