"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { router, usePage } from "@inertiajs/react";
import { toast } from "@/Components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Progress } from "@/Components/ui/progress";
import { Upload } from "lucide-react"; // アップロードアイコン
import { BASE_URL } from "@/app";
import { PageProps } from "@/types";

interface FileProgress {
  file: File;
  progress: number;
}

export default function FileUploader() {
  const { commons } = usePage<PageProps>().props;
  const [filesProgress, setFilesProgress] = useState<FileProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const groupId = commons.selected_group ? commons.selected_group.id : undefined;

  // グローバルなドラッグイベントの監視
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragOver(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        setIsDragOver(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragOver(false);
    };

    // グローバルなドラッグイベントリスナーを追加
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);


  // 単一ファイルのアップロード処理を複数対応にしたもの
  const uploadFile = async (file: File, fileIndex: number, totalFiles: number) => {
    const postUrl = BASE_URL + "/files/upload";
    const chunkSize = Number(commons.chunk_upload_size);
    const chunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("file", chunk, file.name);
      formData.append("title", file.name);
      formData.append("group_id", String(groupId));
      formData.append("is_last_chunk", i === chunks - 1 ? "1" : "0");

      await axios.post(postUrl, formData);

      // ファイルごとの進捗更新
      setFilesProgress((prev) =>
        prev.map((fp, idx) =>
          idx === fileIndex
            ? { ...fp, progress: ((i + 1) / chunks) * 100 }
            : fp
        )
      );
    }

    toast({
      variant: "success",
      title: `アップロード完了 (${fileIndex + 1}/${totalFiles})`,
      description: `${file.name} がアップロードされました。`,
    });
  };

  // ドロップイベント
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsDragOver(false); // ドロップしたら非表示に
      setIsUploading(true);
      setFilesProgress(acceptedFiles.map((file) => ({ file, progress: 0 })));

      for (let i = 0; i < acceptedFiles.length; i++) {
        try {
          await uploadFile(acceptedFiles[i], i, acceptedFiles.length);
        } catch (err) {
          console.error(err);
          toast({
            variant: "destructive",
            title: "アップロード失敗",
            description: `${acceptedFiles[i].name} のアップロードに失敗しました。`,
          });
        }
      }

      setIsUploading(false);
      router.reload();
    },
    [commons, BASE_URL, groupId]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div>
      {/* オーバーレイドロップゾーン - ドラッグ中のみ表示 */}
      {isDragOver && (
        <div
          {...getRootProps()}
          className={`fixed inset-0 z-50 flex items-center justify-center transition bg-blue-500/40 opacity-100`}
        >
          <div>
            <input {...getInputProps()} />
            <div className="text-center text-white">
              <Upload className="mx-auto h-16 w-16 mb-4" />
              <p className="text-2xl font-bold">ファイルをここへドロップ</p>
            </div>
          </div>
        </div>
      )}


      {/* 進捗ダイアログ */}
      <Dialog open={isUploading}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>アップロード中...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {filesProgress.map((fp, index) => (
              <div key={index}>
                <p className="text-sm mb-1">
                  {index + 1}/{filesProgress.length} : {fp.file.name}
                </p>
                <Progress value={fp.progress} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
