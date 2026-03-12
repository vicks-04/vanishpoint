# VanishPoint Secure Suite (MERN)

This project was migrated to a MERN architecture while preserving the same UI flows and business behavior:
- Private Mode and Team Mode remain React client workflows.
- Vault and Authentication were migrated from Supabase to `Express + MongoDB`.
- Vault encryption/decryption remains client-side (AES-GCM via Web Crypto), exactly as before.

## Folder Structure

```text
vanishpoint-secure-suite-main/
  backend/
    src/
      config/
        db.js
        env.js
        paths.js
      controllers/
        authController.js
        fileController.js
        folderController.js
        shareController.js
      middleware/
        auth.js
        errorHandler.js
        upload.js
      models/
        PasswordResetToken.js
        User.js
        VaultFile.js
        VaultFolder.js
        VaultShare.js
      routes/
        authRoutes.js
        vaultRoutes.js
      utils/
        crypto.js
        errors.js
        serializers.js
      app.js
      server.js
    storage/
      vault-files/
    .env.example
    package.json

  frontend/
    src/
      components/
      contexts/
      hooks/
      lib/
      pages/
    public/
    .env
    .env.example
    package.json
    vite.config.ts
    ...

  package.json
  README.md
```

## API Endpoints

Base URL: `http://localhost:5000/api`

### Auth
- `POST /auth/signup`
  - Body: `{ email, password, displayName }`
  - Creates user (same validation rules).
- `POST /auth/login`
  - Body: `{ email, password }`
  - Returns JWT + user profile.
- `GET /auth/me` (Bearer token)
  - Returns current user.
- `POST /auth/logout` (Bearer token)
  - Stateless logout response.
- `POST /auth/forgot-password`
  - Body: `{ email }`
  - Generates reset token; in non-production also returns `resetLink`.
- `POST /auth/reset-password`
  - Body: `{ token, password }`
  - Resets password.

### Vault Folders (Bearer token required)
- `GET /vault/folders`
- `POST /vault/folders`
  - Body: `{ name, parentId? }`
- `PATCH /vault/folders/:folderId`
  - Body: `{ name }`
- `DELETE /vault/folders/:folderId`

### Vault Files (Bearer token required)
- `GET /vault/files?folderId=<id>`
- `POST /vault/files` (multipart/form-data)
  - Fields: `file`, `folderId`, `name`, `encryptedName`, `size`, `type`, `encryptionSalt`, `encryptionIv`
- `GET /vault/files/:fileId/download`
- `DELETE /vault/files/:fileId`

### Vault Shares (Bearer token required)
- `GET /vault/shares?fileId=<id>`
- `POST /vault/shares`
  - Body: `{ fileId, expiresInHours? }`
- `DELETE /vault/shares/:shareId`

## MongoDB Schema (Mongoose Models)

### `User`
- `email` (unique, required, lowercase)
- `passwordHash` (required)
- `displayName` (max 100)
- `avatarUrl` (nullable)
- `roles` (`admin`/`user`, default `user`)
- timestamps

### `PasswordResetToken`
- `userId` (ref `User`)
- `tokenHash` (unique)
- `expiresAt` (TTL index)
- `consumedAt` (nullable)
- created timestamp

### `VaultFolder`
- `userId` (ref `User`)
- `name` (trimmed, 1..255)
- `parentId` (self-ref, nullable)
- timestamps

### `VaultFile`
- `userId` (ref `User`)
- `folderId` (ref `VaultFolder`, nullable)
- `name` (trimmed, 1..255)
- `encryptedName`
- `size`
- `type`
- `encryptionSalt`
- `encryptionIv`
- `storagePath`
- timestamps

### `VaultShare`
- `fileId` (ref `VaultFile`)
- `createdBy` (ref `User`)
- `token` (unique)
- `expiresAt`
- created timestamp

## Run Locally

## 1) Backend setup

```bash
cd backend
npm install
cp .env.example .env
# set MONGODB_URI and JWT_SECRET in backend/.env
npm run dev
```

## 2) Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend default URL: `http://localhost:8080`  
Backend default URL: `http://localhost:5000`

## 3) Run both from root (optional)

```bash
npm install
npm run dev
```

## Notes on Behavior Parity
- Vault file encryption/decryption logic remains client-side and unchanged.
- Folder/file ownership checks mirror old RLS behavior.
- Folder/file/display-name validations mirror previous DB constraints.
- Reset password flow uses tokenized link format: `/reset-password#type=recovery&token=...`.
