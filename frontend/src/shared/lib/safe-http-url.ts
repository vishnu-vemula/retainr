export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value || value !== value.trim() || /[\u0000-\u001f\u007f]/u.test(value)) return null
  try {
    const url = new URL(value)
    if ((url.protocol === 'http:' || url.protocol === 'https:') && !url.username && !url.password) return value
  } catch {
    return null
  }
  return null
}
