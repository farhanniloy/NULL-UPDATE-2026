import prisma from '../src/utils/connect.js';

// Deterministic hash function used for avatar style selection
const stableHash = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const styles = ["identicon","pixel-art","bottts","micah","adventurer"];
const makeAvatar = (seed, style) => `https://avatars.dicebear.com/api/${style}/${encodeURIComponent(seed)}.svg`;

console.log('Starting backfill of comment avatars...');

const run = async () => {
  // Find comments missing avatar
  const comments = await prisma.comment.findMany({
    where: { avatar: null },
    include: { user: true },
    take: 1000,
  });

  console.log(`Found ${comments.length} comments without avatar (processing up to 1000).`);

  let updated = 0;
  for (const c of comments) {
    let seed;
    if (c.userEmail) {
      // prefer userEmail for deterministic seed; if user has image, skip
      if (c.user && c.user.image) {
        continue; // skip, UI will show user.image
      }
      seed = c.userEmail;
    } else {
      seed = `${c.name || 'anon'}|${c.ipAddr || ''}`;
    }
    const style = styles[stableHash(seed) % styles.length];
    const avatar = makeAvatar(seed, style);

    try {
      await prisma.comment.update({ where: { id: c.id }, data: { avatar } });
      updated++;
    } catch (err) {
      console.error('Failed to update comment', c.id, err.message || err);
    }
  }

  console.log(`Backfill complete. Updated ${updated} comments.`);
  process.exit(0);
};

run().catch(err=>{console.error(err); process.exit(1);});
