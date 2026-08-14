import * as LucideIcons from 'lucide-react';

export function getIconByName(name, fallbackIcon = LucideIcons.Sparkles) {
  if (!name) return fallbackIcon;
  if (typeof name !== 'string') return name; // If an icon component was already passed
  const IconComponent = LucideIcons[name];
  return IconComponent || fallbackIcon;
}
