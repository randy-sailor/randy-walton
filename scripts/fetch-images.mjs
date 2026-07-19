// Downloads the legacy Squarespace-hosted essay images so they are
// self-hosted from /public/images. Runs before every build (prebuild).
// Never fails the build: if a download errors, the existing file (if any)
// is kept and the build continues.
import { writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://images.squarespace-cdn.com/content/v1/587fc08abe6594efd892ea91/';
const IMAGES = {
  'leadercast.png': '1484768992281-8BVQY1LSMRB5EQRY4IZD/Screen-Shot-2015-07-28-at-9.03.30-AM-300x167.png.30-AM-300x167.png?format=original',
  'zeroinbox.jpg': '1484768992281-DL1WSWQMEZWI4N7U83EZ/IMG_5352-225x300.jpg?format=original',
  'whitespace.jpg': '1484768992369-YADS6L52GZVDK9OXL1V5/dramaticwhitespace.jpg',
  'divingboard.jpg': '1484768992360-FC94QHKKHRBL95J0YUAW/diving_board_girl_600x600.jpg',
  'liar.jpg': '1484768992279-EC7YYDFIHSFM1GPORE6Z/liar.jpg',
  'cookie.jpg': '1484768992280-LGN8C9JVX9XO36S5YULJ/images.jpg',
  'giveback.jpg': '1484768992379-39VOM9UXTTHRGCEZP8RY/give_back.jpg',
  'bobdylan.jpg': '1484768992281-H6YC9D1B2NWGXVKAZXLK/bob_dylan_live.jpg',
  'negotiation.jpg': '1484768992386-QXOPMG1J66LE8U0VHE9X/salary-negotiation-techniques.jpg',
};

const dir = path.join(process.cwd(), 'public', 'images');
await mkdir(dir, { recursive: true });

for (const [name, tail] of Object.entries(IMAGES)) {
  const dest = path.join(dir, name);
  const exists = await access(dest).then(() => true, () => false);
  if (exists) continue;
  try {
    const res = await fetch(BASE + tail, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    await writeFile(dest, Buffer.from(await res.arrayBuffer()));
    console.log('fetched', name);
  } catch (err) {
    console.warn('skip', name, '-', err.message);
  }
}
