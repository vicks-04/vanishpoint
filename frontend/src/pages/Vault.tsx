import { useState } from "react";
import {
  Lock, Folder, FolderPlus, File, Download, Trash2,
  Search, Clock, Shield, MoreVertical, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useVaultFolders, useVaultFiles } from "@/hooks/useVaultFiles";
import FileUpload from "@/components/vault/FileUpload";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VaultFile } from "@/hooks/useVaultFiles";

const Vault = () => {
  const { user } = useAuth();
  const { folders, createFolder, deleteFolder, renameFolder } = useVaultFolders();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { files, loading: filesLoading, uploading, uploadProgress, uploadFile, downloadFile, deleteFile } = useVaultFiles(selectedFolderId);
  const [searchQuery, setSearchQuery] = useState("");

  // New folder dialog
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Download/decrypt dialog
  const [decryptDialogOpen, setDecryptDialogOpen] = useState(false);
  const [decryptPassphrase, setDecryptPassphrase] = useState("");
  const [fileToDecrypt, setFileToDecrypt] = useState<VaultFile | null>(null);


  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim());
    setNewFolderName("");
    setNewFolderOpen(false);
  };

  const handleDownloadClick = (file: VaultFile) => {
    setFileToDecrypt(file);
    setDecryptPassphrase("");
    setDecryptDialogOpen(true);
  };

  const handleDecryptAndDownload = async () => {
    if (!fileToDecrypt || !decryptPassphrase) return;
    await downloadFile(fileToDecrypt, decryptPassphrase);
    setDecryptDialogOpen(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);
  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-16 flex">
      {/* Sidebar - Folders */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-64 border-r border-border flex flex-col"
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Vault</span>
            </div>
            <button
              onClick={() => setNewFolderOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => setSelectedFolderId(null)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
              selectedFolderId === null
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              All Files
            </div>
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                selectedFolderId === folder.id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                {folder.name}
              </div>
              <span className="text-xs">{folder.file_count ?? 0}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="glass-panel p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Storage</span>
              <span className="text-xs font-mono text-primary">
                {formatSize(files.reduce((sum, f) => sum + f.size, 0))}
              </span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Vault</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">
              {selectedFolder?.name || "All Files"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-48"
              />
            </div>
            <FileUpload
              uploading={uploading}
              uploadProgress={uploadProgress}
              onUpload={uploadFile}
            />
          </div>
        </div>

        {/* File list */}
        <div className="flex-1 p-6">
          {filesLoading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              Loading...
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
              <File className="w-8 h-8 opacity-40" />
              <span>No files yet. Upload one to get started.</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_80px_100px_120px_40px] gap-4 px-4 py-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <span>Name</span>
                <span>Type</span>
                <span>Size</span>
                <span>Added</span>
                <span></span>
              </div>

              {filteredFiles.map((file, i) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="grid grid-cols-[1fr_80px_100px_120px_40px] gap-4 px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors group items-center"
                >
                  <div className="flex items-center gap-3">
                    <File className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    <Lock className="w-3 h-3 text-success shrink-0" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{file.type}</span>
                  <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(file.created_at).toLocaleDateString()}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownloadClick(file)}>
                        <Download className="w-4 h-4 mr-2" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteFile(file)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New folder dialog */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="folder-name">Folder name</Label>
            <Input
              id="folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="My folder"
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decrypt & download dialog */}
      <Dialog open={decryptDialogOpen} onOpenChange={setDecryptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Decrypt & Download
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Enter the passphrase used to encrypt <strong>{fileToDecrypt?.name}</strong>
            </p>
            <Input
              type="password"
              placeholder="Encryption passphrase..."
              value={decryptPassphrase}
              onChange={(e) => setDecryptPassphrase(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDecryptAndDownload()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecryptDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDecryptAndDownload} disabled={!decryptPassphrase}>
              <Download className="w-4 h-4 mr-1" /> Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Vault;
