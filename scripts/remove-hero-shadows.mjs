import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const assets = ['chair', 'nightstand', 'table'];
const opaqueThreshold = 200;
const edgeRadius = 4;

function dilate(mask, width, height, radius) {
  const horizontal = Buffer.alloc(mask.length);
  const result = Buffer.alloc(mask.length);

  for (let y = 0; y < height; y += 1) {
    let hits = 0;
    for (let x = 0; x <= radius; x += 1) {
      if (mask[y * width + x]) hits += 1;
    }
    for (let x = 0; x < width; x += 1) {
      horizontal[y * width + x] = hits ? 255 : 0;
      const leaving = x - radius;
      const entering = x + radius + 1;
      if (leaving >= 0 && mask[y * width + leaving]) hits -= 1;
      if (entering < width && mask[y * width + entering]) hits += 1;
    }
  }

  for (let x = 0; x < width; x += 1) {
    let hits = 0;
    for (let y = 0; y <= radius; y += 1) {
      if (horizontal[y * width + x]) hits += 1;
    }
    for (let y = 0; y < height; y += 1) {
      result[y * width + x] = hits ? 255 : 0;
      const leaving = y - radius;
      const entering = y + radius + 1;
      if (leaving >= 0 && horizontal[leaving * width + x]) hits -= 1;
      if (entering < height && horizontal[entering * width + x]) hits += 1;
    }
  }

  return result;
}

for (const asset of assets) {
  const input = `src/assets/hero-${asset}.png`;
  const output = `src/assets/hero-${asset}-shadowless.png`;
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const coreMask = Buffer.alloc(info.width * info.height);

  for (let pixel = 0; pixel < coreMask.length; pixel += 1) {
    coreMask[pixel] = data[pixel * 4 + 3] >= opaqueThreshold ? 255 : 0;
  }

  // Keep the solid object plus a small halo of its original anti-aliased edge.
  // Isolated semi-transparent pixels farther away are the baked floor shadow.
  const keepMask = dilate(coreMask, info.width, info.height, edgeRadius);

  for (let pixel = 0; pixel < keepMask.length; pixel += 1) {
    if (keepMask[pixel] === 0) data[pixel * 4 + 3] = 0;
  }

  await sharp(data, { raw: info }).png().toFile(output);
  console.log(`Created ${output}`);
}

const imageIds = ['image0_65_897', 'image1_65_897', 'image2_65_897'];
let heroSvg = await readFile('src/assets/hero.svg', 'utf8');

for (let index = 0; index < assets.length; index += 1) {
  const png = await readFile(`src/assets/hero-${assets[index]}-shadowless.png`);
  const imageData = `data:image/png;base64,${png.toString('base64')}`;
  const imagePattern = new RegExp(`(<image id="${imageIds[index]}"[^>]*xlink:href=")[^"]+("[^>]*/>)`);
  heroSvg = heroSvg.replace(imagePattern, `$1${imageData}$2`);
}

if (!heroSvg.includes('hero-floor-shadows')) {
  heroSvg = heroSvg.replace(
    '<g class="furniture furniture--chair">',
    `<g id="hero-floor-shadows" aria-hidden="true">
  <g transform="rotate(-8 181 616)"><ellipse class="floor-shadow floor-shadow--chair" cx="181" cy="616" rx="70" ry="10" fill="#333F2E" filter="url(#floor-shadow-blur)"/></g>
  <g transform="rotate(-7 421 389)"><ellipse class="floor-shadow floor-shadow--cabinet" cx="421" cy="389" rx="67" ry="9" fill="#333F2E" filter="url(#floor-shadow-blur)"/></g>
  <g transform="rotate(-5 431 739)"><ellipse class="floor-shadow floor-shadow--table" cx="431" cy="739" rx="82" ry="11" fill="#333F2E" filter="url(#floor-shadow-blur)"/></g>
</g>
<g class="furniture furniture--chair">`,
  );
  heroSvg = heroSvg.replace(
    '<defs>',
    `<defs>
<filter id="floor-shadow-blur" x="-30%" y="-250%" width="160%" height="600%" color-interpolation-filters="sRGB">
  <feGaussianBlur stdDeviation="7"/>
</filter>`,
  );
}

await writeFile('src/assets/hero.svg', heroSvg);
console.log('Updated src/assets/hero.svg with static coded shadows');
