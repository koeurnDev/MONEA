import sharp from "sharp";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const supportedExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".tif", ".tiff", ".webp"]);
const targetEdges = [640, 1280, 2000];

function usage() {
    console.log(`Prepare wedding photos as metadata-free WebP variants.

Usage:
  npm run photos:prepare -- <photo-folder> [--out <directory>] [--base-url </public-path>]

Defaults:
  --out       public/wedding-gallery
  --base-url  /wedding-gallery

Each source image is oriented, resized without upscaling to 640/1280/2000 px
maximum-edge variants, and written alongside a gallery.json manifest.`);
}

function parseArguments(args) {
    const options = {
        input: "",
        output: path.resolve("public/wedding-gallery"),
        baseUrl: "/wedding-gallery",
    };

    for (let index = 0; index < args.length; index += 1) {
        const argument = args[index];
        if (argument === "--help" || argument === "-h") {
            options.help = true;
        } else if (argument === "--out" || argument === "--base-url") {
            const value = args[index + 1];
            if (!value || value.startsWith("--")) {
                throw new Error(`${argument} requires a value.`);
            }
            if (argument === "--out") options.output = path.resolve(value);
            else options.baseUrl = value;
            index += 1;
        } else if (argument.startsWith("-")) {
            throw new Error(`Unknown option: ${argument}`);
        } else if (options.input) {
            throw new Error("Provide one source photo folder.");
        } else {
            options.input = path.resolve(argument);
        }
    }

    if (!options.help && !options.input) {
        throw new Error("Provide the folder containing the original wedding photos.");
    }
    if (!/^\/(?!\/)[^?#]*$/.test(options.baseUrl)) {
        throw new Error("--base-url must be an absolute site path such as /wedding-gallery.");
    }

    return options;
}

function isWithin(parent, candidate) {
    const relative = path.relative(parent, candidate);
    return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

async function listPhotos(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const photos = [];

    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            photos.push(...await listPhotos(entryPath));
        } else if (entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase())) {
            photos.push(entryPath);
        }
    }

    return photos;
}

function safeStem(fileName) {
    return path.parse(fileName).name
        .normalize("NFC")
        .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
        .replace(/[. ]+$/g, "")
        .trim() || "wedding-photo";
}

function publicUrl(baseUrl, relativePath) {
    return [baseUrl.replace(/\/+$/, ""), ...relativePath.split(path.sep)]
        .map((segment, index) => index === 0 ? segment : encodeURIComponent(segment))
        .join("/");
}

async function preparePhotos(options) {
    const inputStats = await stat(options.input);
    if (!inputStats.isDirectory()) {
        throw new Error(`Source is not a directory: ${options.input}`);
    }
    if (isWithin(options.input, options.output) || isWithin(options.output, options.input)) {
        throw new Error("Source and output folders must be separate, non-nested directories.");
    }

    const photos = await listPhotos(options.input);
    if (photos.length === 0) {
        throw new Error(`No supported photos found in ${options.input}.`);
    }

    const outputNames = new Set();
    const galleryItems = [];

    for (const sourcePath of photos) {
        const sourceRelative = path.relative(options.input, sourcePath);
        const sourceDirectory = path.dirname(sourceRelative);
        const outputDirectory = sourceDirectory === "."
            ? options.output
            : path.join(options.output, sourceDirectory);
        const sourceExtension = path.extname(sourcePath);
        const sourceBase = path.basename(sourcePath, sourceExtension);
        const sourceMetadata = await sharp(sourcePath).metadata();
        if (!sourceMetadata.width || !sourceMetadata.height) {
            throw new Error(`Could not read image dimensions: ${sourcePath}`);
        }

        const sourceMaxEdge = Math.max(sourceMetadata.width, sourceMetadata.height);
        const sizes = targetEdges.filter((edge) => edge <= sourceMaxEdge);
        if (sizes.length === 0) sizes.push(sourceMaxEdge);
        else if (sizes.at(-1) < sourceMaxEdge && sourceMaxEdge < targetEdges.at(-1)) sizes.push(sourceMaxEdge);

        let stem = safeStem(sourceBase);
        const sourceTypeSuffix = sourceExtension.slice(1).toLowerCase();
        stem = `${stem}-${sourceTypeSuffix}`;
        const collisionKey = path.join(sourceDirectory, stem).toLowerCase();
        let uniqueStem = stem;
        let duplicateIndex = 2;
        while (outputNames.has(path.join(sourceDirectory, uniqueStem).toLowerCase())) {
            uniqueStem = `${stem}-${duplicateIndex}`;
            duplicateIndex += 1;
        }
        outputNames.add(collisionKey);
        outputNames.add(path.join(sourceDirectory, uniqueStem).toLowerCase());
        await mkdir(outputDirectory, { recursive: true });

        const variants = [];
        for (const edge of sizes) {
            const targetPath = path.join(outputDirectory, `${uniqueStem}-${edge}px.webp`);
            const info = await sharp(sourcePath)
                .rotate()
                .resize({
                    width: edge,
                    height: edge,
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .webp({ quality: 83, effort: 5 })
                .toFile(targetPath);

            const relativeOutput = path.relative(options.output, targetPath);
            variants.push({
                url: publicUrl(options.baseUrl, relativeOutput),
                width: info.width,
                height: info.height,
                maxEdge: edge,
            });
        }

        const largest = variants.at(-1);
        if (!largest) throw new Error(`No WebP variants were created for ${sourcePath}.`);
        const alt = sourceBase.replace(/[_-]+/g, " ").trim();
        galleryItems.push({
            type: "IMAGE",
            url: largest.url,
            srcSet: variants.map((variant) => `${variant.url} ${variant.width}w`).join(", "),
            width: largest.width,
            height: largest.height,
            alt,
        });

        console.log(`[Prepared] ${sourceRelative} → ${variants.map(({ maxEdge }) => `${maxEdge}px`).join(", ")}`);
    }

    await mkdir(options.output, { recursive: true });
    await writeFile(
        path.join(options.output, "gallery.json"),
        `${JSON.stringify({ galleryItems }, null, 2)}\n`,
        "utf8",
    );
    console.log(`[Manifest] ${path.join(options.output, "gallery.json")} (${galleryItems.length} photos)`);
}

try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) usage();
    else await preparePhotos(options);
} catch (error) {
    console.error(`[Photo preparation failed] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
}
