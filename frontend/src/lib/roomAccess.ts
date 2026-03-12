const ROOM_ACCESS_PREFIX = "vp_room_access:";
const ROOM_HOST_PREFIX = "vp_room_host:";
const TEAM_HOST_PREFIX = "vp_team_host:";

export function roomAccessStorageKey(roomId: string) {
  return `${ROOM_ACCESS_PREFIX}${roomId}`;
}

export function getRoomAccessToken(roomId: string) {
  if (!roomId) return null;
  return localStorage.getItem(roomAccessStorageKey(roomId));
}

export function setRoomAccessToken(roomId: string, token: string) {
  if (!roomId || !token) return;
  localStorage.setItem(roomAccessStorageKey(roomId), token);
}

export function clearRoomAccessToken(roomId: string) {
  if (!roomId) return;
  localStorage.removeItem(roomAccessStorageKey(roomId));
}

export function roomHostStorageKey(roomId: string) {
  return `${ROOM_HOST_PREFIX}${roomId}`;
}

export function setRoomHostKey(roomId: string, hostKey: string) {
  if (!roomId || !hostKey) return;
  localStorage.setItem(roomHostStorageKey(roomId), hostKey);
}

export function getRoomHostKey(roomId: string) {
  if (!roomId) return null;
  return localStorage.getItem(roomHostStorageKey(roomId));
}

export function clearRoomHostKey(roomId: string) {
  if (!roomId) return;
  localStorage.removeItem(roomHostStorageKey(roomId));
}

export function teamHostStorageKey(code: string) {
  return `${TEAM_HOST_PREFIX}${code}`;
}

export function setTeamHostKey(code: string, hostKey: string) {
  if (!code || !hostKey) return;
  localStorage.setItem(teamHostStorageKey(code), hostKey);
}

export function getTeamHostKey(code: string) {
  if (!code) return null;
  return localStorage.getItem(teamHostStorageKey(code));
}

export function clearTeamHostKey(code: string) {
  if (!code) return;
  localStorage.removeItem(teamHostStorageKey(code));
}
