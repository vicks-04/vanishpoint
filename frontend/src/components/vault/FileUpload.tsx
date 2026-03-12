import { useState, useRef } from "react";
import { Upload, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileUploadProps {
  uploading: boolean;
  uploadProgress: number;
  onUpload: (file: File, passphrase: string) => Promise<void>;
}

const FileUpload = ({ uploading, uploadProgress, onUpload }: FileUploadProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be under 50 MB");
      return;
    }
    setSelectedFile(file);
    setDialogOpen(true);
  };

  const handleUpload = async () => {
    if (!selectedFile || !passphrase) return;
    await onUpload(selectedFile, passphrase);
    setDialogOpen(false);
    setPassphrase("");
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
      />
      <Button
        variant="default"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <Upload className="w-4 h-4" />
        Upload
      </Button>

      {uploading && (
        <div className="w-32">
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Encrypt & Upload
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              <strong>{selectedFile?.name}</strong> ({((selectedFile?.size || 0) / 1024).toFixed(1)} KB)
            </p>
            <div className="space-y-2">
              <Label htmlFor="passphrase">Encryption Passphrase</Label>
              <Input
                id="passphrase"
                type="password"
                placeholder="Enter a strong passphrase..."
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You'll need this exact passphrase to decrypt and download the file later.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!passphrase}>
              <Lock className="w-4 h-4 mr-1" />
              Encrypt & Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileUpload;
