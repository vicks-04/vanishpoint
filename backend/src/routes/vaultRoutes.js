import { Router } from "express";
import {
  createFolder,
  deleteFolder,
  getFolders,
  renameFolder,
} from "../controllers/folderController.js";
import {
  deleteFile,
  downloadFile,
  getFiles,
  uploadFile,
} from "../controllers/fileController.js";
import { createShare, deleteShare, getShares } from "../controllers/shareController.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.use(requireAuth);

router.get("/folders", getFolders);
router.post("/folders", createFolder);
router.patch("/folders/:folderId", renameFolder);
router.delete("/folders/:folderId", deleteFolder);

router.get("/files", getFiles);
router.post("/files", upload.single("file"), uploadFile);
router.get("/files/:fileId/download", downloadFile);
router.delete("/files/:fileId", deleteFile);

router.get("/shares", getShares);
router.post("/shares", createShare);
router.delete("/shares/:shareId", deleteShare);

export default router;
