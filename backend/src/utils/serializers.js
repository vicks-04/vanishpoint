function toId(value) {
  if (!value) return null;
  return value.toString();
}

export function serializeUser(user) {
  const fullName = user.fullName || user.displayName || null;
  const provider = user.provider || (user.googleId ? "google" : "local");

  return {
    id: toId(user._id),
    email: user.email,
    full_name: fullName,
    display_name: fullName,
    avatar_url: user.avatarUrl || null,
    provider,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}

export function serializeFolder(folder, fileCount = 0) {
  return {
    id: toId(folder._id),
    name: folder.name,
    parent_id: toId(folder.parentId),
    created_at: folder.createdAt,
    file_count: fileCount,
  };
}

export function serializeFile(file) {
  return {
    id: toId(file._id),
    name: file.name,
    type: file.type,
    size: file.size,
    storage_path: file.storagePath,
    encryption_salt: file.encryptionSalt,
    encryption_iv: file.encryptionIv,
    created_at: file.createdAt,
    folder_id: toId(file.folderId),
  };
}

export function serializeShare(share) {
  return {
    id: toId(share._id),
    file_id: toId(share.fileId),
    token: share.token,
    expires_at: share.expiresAt,
    created_at: share.createdAt,
  };
}
