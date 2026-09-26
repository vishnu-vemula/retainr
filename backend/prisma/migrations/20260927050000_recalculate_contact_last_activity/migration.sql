UPDATE "Contact" AS contact
SET "lastActivityAt" = (
  SELECT MAX(activity."occurredAt")
  FROM "Activity" AS activity
  WHERE activity."contactId" = contact."id"
    AND activity."ownerId" = contact."ownerId"
)
WHERE contact."lastActivityAt" IS DISTINCT FROM (
  SELECT MAX(activity."occurredAt")
  FROM "Activity" AS activity
  WHERE activity."contactId" = contact."id"
    AND activity."ownerId" = contact."ownerId"
);
