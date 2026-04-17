const ICON_ALIASES: Record<string, string> = {
  restaurant: 'silverware-fork-knife',
  shape: 'shape-outline',
  'block-helper': 'close-octagon-outline',
  'note-text': 'note-text-outline',
  'bottle-tonic': 'water-outline',
};

export const resolveIconName = (
  icon?: string,
  fallback = 'help-circle-outline'
) => (icon && ICON_ALIASES[icon]) || icon || fallback;
