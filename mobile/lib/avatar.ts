export function getAvatarColor(name: string): string {
  const hash = Math.abs(
    name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0),
  );
  return `hsl(${hash % 360}, 80%, 55%)`;
}
