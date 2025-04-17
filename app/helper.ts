import * as fs from "fs";
import zlib, { inflate, inflateSync } from "zlib";
import crypto from "crypto";

export const initCommand = () => {
  // You can use print statements as follows for debugging, they'll be visible when running tests.
  // console.error("Logs from your program will appear here!");

  // Uncomment this block to pass the first stage
  fs.mkdirSync(".git", { recursive: true });
  fs.mkdirSync(".git/objects", { recursive: true });
  fs.mkdirSync(".git/refs", { recursive: true });
  fs.writeFileSync(".git/HEAD", "ref: refs/heads/main\n");
  console.log("Initialized git directory");
};

export const catFileCommand = (hash: string) => {
  // const blobDir = args[2].substring(0, 2);
  // const blobFileName = args[2].substring(2);
  // const blob = fs.readFileSync(`.git/objects/${blobDir}/${blobFileName}`);
  // const decompressed = zlib.unzipSync(new Uint8Array(blob));
  // const nullByteIndex = decompressed.indexOf(0);
  // const blobContent = decompressed.subarray(nullByteIndex + 1).toString();
  // process.stdout.write(blobContent);

  //consise solution
  const file = fs.readFileSync(
    `.git/objects/${hash.slice(0, 2)}/${hash.slice(2)}`
  );
  const blob = zlib.unzipSync(new Uint8Array(file)).toString().split("\0")[1];
  process.stdout.write(blob);
};

export const hashObjectCommand = (blobContent: string) => {
  const data = fs.readFileSync(blobContent) as unknown as Uint8Array;
  const metaData = Buffer.from(
    `blob ${data.length}\0`
  ) as unknown as Uint8Array;
  const content = Buffer.concat([metaData, data]) as unknown as Uint8Array;

  //hashing
  const hash = crypto.createHash("sha1").update(content).digest("hex");
  process.stdout.write(hash);

  const compressed = zlib.deflateSync(
    new Uint8Array(content)
  ) as unknown as Uint8Array;

  const dir = `.git/objects/${hash.slice(0, 2)}`;
  const objectPath = `${dir}/${hash.slice(2)}`;

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(objectPath, compressed);
};

export const lsTreeCommand = (treeHash: string) => {
  const f = fs.readFileSync(
    `.git/objects/${treeHash.slice(0, 2)}/${treeHash.slice(2)}`
  );

  const decompressed = zlib.inflateSync(new Uint8Array(f));
  const treeContent = decompressed
    .toString()
    .split("\0")
    .slice(1, -1)
    .reduce((acc: string[], e) => [...acc, e.split(" ").at(-1) as string], [])
    .join("\n");
  process.stdout.write(treeContent);
};
