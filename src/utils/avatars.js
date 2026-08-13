export const styles = ["identicon","pixel-art","bottts","micah","adventurer"];

export function stableHash(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function chooseStyle(seed) {
  return styles[stableHash(seed) % styles.length];
}

export function makeAvatar(seed) {
  const style = chooseStyle(seed);
  return `https://api.dicebear.com/6.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}
