export interface TagsOwnershipChecker {
  assertAllOwned(tagIds: string[], ownerId: string): Promise<void>;
}
