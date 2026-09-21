/** Org-scoped seed ids: same tag on concepts and collections so FKs stay aligned. */
export function userTag(userId: string) {
  return userId.slice(0, 8);
}

export function taggedId(id: string, userId: string) {
  return `${id}-${userTag(userId)}`;
}
