const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const sourceDirectory = path.resolve(
  __dirname,
  '../src/components/services/serviceImage'
);
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png']);
const maxSize = 1920;
const quality = 84;

async function getImagePaths(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return getImagePaths(entryPath);
      }

      return supportedExtensions.has(path.extname(entry.name).toLowerCase())
        ? [entryPath]
        : [];
    })
  );

  return paths.flat();
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function optimizeImage(sourcePath) {
  const extension = path.extname(sourcePath);
  const outputPath = sourcePath.slice(0, -extension.length) + '.webp';
  const sourceStats = await fs.stat(sourcePath);

  await sharp(sourcePath)
    .rotate()
    .resize({
      width: maxSize,
      height: maxSize,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 6 })
    .toFile(outputPath);

  const outputStats = await fs.stat(outputPath);

  console.log(
    `${path.basename(sourcePath)}: ${formatBytes(sourceStats.size)} -> ${formatBytes(outputStats.size)}`
  );

  return {
    sourceBytes: sourceStats.size,
    outputBytes: outputStats.size,
  };
}

async function main() {
  const imagePaths = await getImagePaths(sourceDirectory);
  const results = [];

  for (const imagePath of imagePaths) {
    results.push(await optimizeImage(imagePath));
  }

  const sourceBytes = results.reduce(
    (total, result) => total + result.sourceBytes,
    0
  );
  const outputBytes = results.reduce(
    (total, result) => total + result.outputBytes,
    0
  );
  const reduction = sourceBytes
    ? Math.round((1 - outputBytes / sourceBytes) * 100)
    : 0;

  console.log(
    `Optimized ${results.length} images: ${formatBytes(sourceBytes)} -> ${formatBytes(outputBytes)} (${reduction}% smaller)`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
