export function getPermissions(): string[] {
  if (typeof window === "undefined") return [];

  const token = localStorage.getItem("access_token");
  if (!token) return [];

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.permissions || [];
  } catch (e) {
    console.error("Failed to decode token permissions", e);
    return [];
  }
}

export function getUser(): any {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user || payload;
  } catch (e) {
    return null;
  }
}

export function isSuperUser(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("access_token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return !!payload.is_superuser;
  } catch (e) {
    return false;
  }
}
