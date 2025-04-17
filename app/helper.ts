//@ts-nocheck

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
  console.log(treeContent);
  //   process.stdout.write(treeContent);
};

//write tree
type TreeEntry = {
  mode: string;
  name: string;
  hash: string;
};
const createTreeString = ({ mode, hash, name }: TreeEntry) => {
  const hexHashToBuffer = Buffer.from(hash, "hex");

  const bufferone = Buffer.concat([
    Buffer.from(`${mode} ${name}\0`),
    hexHashToBuffer,
  ]);

  return bufferone;
};

const toObjectEntry = (mode: string, hash: string, name: string): TreeEntry => {
  return { mode, hash, name };
};

export const writeTreeForFolder = (currentPath: string) => {
  const currentTreeEntries: TreeEntry[] = [];
  await Promise.all(
    fs.readdirSync(currentPath, { withFileTypes: true }).map(async (file) => {
      if (file.name === ".git") return;
      if (file.isDirectory()) {
        const aaa = await writeTreeForFolder(path.join(currentPath, file.name));
        currentTreeEntries.push(toObjectEntry("40000", aaa, file.name));
      } else if (file.isSymbolicLink()) {
        throw new Error("Symbolic links are not supported");
      } else if (file.isFile()) {
        const hash = await hashObject(path.join(currentPath, file.name));
        const isExecutable = !!(
          fs.statSync(path.join(currentPath, file.name)).mode & 0o111
        );
        const mode = isExecutable ? "100755" : "100644";
        currentTreeEntries.push(toObjectEntry(mode, hash, file.name));
      } else {
        throw new Error("Error");
      }
    })
  );

  const sortedEntries = currentTreeEntries
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(createTreeString);

  return await writeObject(Buffer.concat(sortedEntries), "tree");
};

function writeObject(
  blobContent: Buffer,
  type: "blob" | "tree"
): Promise<string> {
  return new Promise((reslove) => {
    const blobContentLength = blobContent.length;
    const blobHeader = Buffer.from(`${type} ${blobContentLength}\0`);
    const blob = Buffer.concat([blobHeader, blobContent]);

    zlib.deflate(blob, (_, compressed) => {
      const hash = crypto
        .createHash("sha1")
        .update(blob)
        .digest("hex")
        .toString();
      const dir = `.git/objects/${hash.slice(0, 2)}`;
      const objectPath = `${dir}/${hash.slice(2)}`;

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(objectPath, blob);
      reslove(hash);
    });
  });
}

function hashObject(filePath: string): Promise<string> {
  return new Promise((reslove) => {
    fs.readFile(filePath, (err, blobContent) => {
      reslove(writeObject(blobContent, "blob"));
    });
  });
}
