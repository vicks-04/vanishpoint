import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { encryptFile, decryptFile } from "@/lib/crypto";
import { toast } from "sonner";
import { apiRequest, apiRequestBlob } from "@/lib/api";

export interface VaultFolder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  file_count?: number;
}

export interface VaultFile {
  id: string;
  name: string;
  type: string;
  size: number;
  storage_path: string;
  encryption_salt: string;
  encryption_iv: string;
  created_at: string;
  folder_id: string | null;
}

export interface VaultShare {
  id: string;
  file_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export function useVaultFolders() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<VaultFolder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFolders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await apiRequest<{ folders: VaultFolder[] }>("/vault/folders");
      setFolders(response.folders || []);
    } catch {
      toast.error("Failed to load folders");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setFolders([]);
      setLoading(false);
      return;
    }
    fetchFolders();
  }, [user, fetchFolders]);

  const createFolder = async (name: string, parentId?: string | null) => {
    if (!user) return;
    try {
      await apiRequest<{ folder: VaultFolder }>("/vault/folders", {
        method: "POST",
        body: JSON.stringify({
          name,
          parentId: parentId || null,
        }),
      });
      toast.success("Folder created");
      fetchFolders();
    } catch {
      toast.error("Failed to create folder");
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      await apiRequest<{ message: string }>(`/vault/folders/${folderId}`, {
        method: "DELETE",
      });
      toast.success("Folder deleted");
      fetchFolders();
    } catch {
      toast.error("Failed to delete folder");
    }
  };

  const renameFolder = async (folderId: string, newName: string) => {
    try {
      await apiRequest<{ folder: VaultFolder }>(`/vault/folders/${folderId}`, {
        method: "PATCH",
        body: JSON.stringify({ name: newName }),
      });
      toast.success("Folder renamed");
      fetchFolders();
    } catch {
      toast.error("Failed to rename folder");
    }
  };

  return { folders, loading, createFolder, deleteFolder, renameFolder, refetch: fetchFolders };
}

export function useVaultFiles(folderId: string | null) {
  const { user } = useAuth();
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchFiles = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const search = folderId ? `?folderId=${encodeURIComponent(folderId)}` : "";
      const response = await apiRequest<{ files: VaultFile[] }>(`/vault/files${search}`);
      setFiles(response.files || []);
    } catch {
      toast.error("Failed to load files");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [user, folderId]);

  useEffect(() => {
    if (!user) {
      setFiles([]);
      setLoading(false);
      return;
    }
    fetchFiles();
  }, [user, fetchFiles]);

  const uploadFile = async (file: File, passphrase: string) => {
    if (!user) return;
    setUploading(true);
    setUploadProgress(10);

    try {
      const arrayBuffer = await file.arrayBuffer();
      setUploadProgress(30);

      const { encrypted, salt, iv } = await encryptFile(arrayBuffer, passphrase);
      setUploadProgress(60);

      const encryptedName = `${crypto.randomUUID()}.enc`;
      const formData = new FormData();
      formData.append("file", new Blob([encrypted], { type: "application/octet-stream" }), encryptedName);
      formData.append("folderId", folderId || "");
      formData.append("name", file.name);
      formData.append("encryptedName", encryptedName);
      formData.append("size", String(file.size));
      formData.append("type", file.name.split(".").pop()?.toUpperCase() || "FILE");
      formData.append("encryptionSalt", salt);
      formData.append("encryptionIv", iv);

      await apiRequest<{ file: VaultFile }>("/vault/files", {
        method: "POST",
        body: formData,
      });
      setUploadProgress(100);
      toast.success("File uploaded & encrypted");
      fetchFiles();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadFile = async (file: VaultFile, passphrase: string) => {
    try {
      const blob = await apiRequestBlob(`/vault/files/${file.id}/download`);
      const encryptedBuffer = await blob.arrayBuffer();
      const decrypted = await decryptFile(
        encryptedBuffer,
        passphrase,
        file.encryption_salt,
        file.encryption_iv
      );

      const outputBlob = new Blob([decrypted]);
      const url = URL.createObjectURL(outputBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("File decrypted & downloaded");
    } catch {
      toast.error("Decryption failed - wrong passphrase?");
    }
  };

  const deleteFile = async (file: VaultFile) => {
    try {
      await apiRequest<{ message: string }>(`/vault/files/${file.id}`, {
        method: "DELETE",
      });
      toast.success("File deleted");
      fetchFiles();
    } catch {
      toast.error("Failed to delete file");
    }
  };

  return { files, loading, uploading, uploadProgress, uploadFile, downloadFile, deleteFile, refetch: fetchFiles };
}

export function useVaultShares() {
  const { user } = useAuth();

  const createShare = async (fileId: string, expiresInHours: number = 24) => {
    if (!user) return null;
    try {
      const response = await apiRequest<{ share: VaultShare }>("/vault/shares", {
        method: "POST",
        body: JSON.stringify({ fileId, expiresInHours }),
      });
      toast.success("Share link created");
      return response.share;
    } catch {
      toast.error("Failed to create share link");
      return null;
    }
  };

  const deleteShare = async (shareId: string) => {
    try {
      await apiRequest<{ message: string }>(`/vault/shares/${shareId}`, {
        method: "DELETE",
      });
      toast.success("Share link revoked");
    } catch {
      toast.error("Failed to delete share");
    }
  };

  return { createShare, deleteShare };
}
