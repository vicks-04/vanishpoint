import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const backendRoot = path.resolve(__dirname, "..", "..");
export const vaultStorageRoot = path.join(backendRoot, "storage", "vault-files");
export const roomAttachmentStorageRoot = path.join(backendRoot, "storage", "room-attachments");
