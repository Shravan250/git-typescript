//@ts-nocheck

import * as fs from "fs";
import zlib, { inflate, inflateSync } from "zlib";
import crypto from "crypto";
import path from "path";

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
function generateHash(bufferValue: Buffer, type: string, write: boolean) {
  const header = `${type} ${bufferValue.length}\0`;
  const store = Buffer.concat([Buffer.from(header, "utf8"), bufferValue]);
  const hash = crypto.createHash("sha1").update(store).digest("hex");

  if (write) {
    const dir = path.join(".git", "objects", hash.slice(0, 2));
    const filePath = path.join(dir, hash.slice(2));

    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (err: any) {
      if (err.code !== "EEXIST") {
        throw err;
      }
    }

    fs.writeFileSync(filePath, zlib.deflateSync(store));
  }

  return hash;
}

export function writeTree(directory: string): string {
  let treeBuffer = Buffer.alloc(0);
  let entriesArray = [];
  let fileEntries = fs.readdirSync(directory, {
    withFileTypes: true,
  });
  for (const entry of fileEntries) {
    if (entry.name === ".git") {
      continue;
    }
    let mode: string;
    let hash: string;
    const pathName = path.join(directory, entry.name);
    if (entry.isFile()) {
      mode = "100644";
      const fileContent = fs.readFileSync(pathName);
      hash = generateHash(fileContent, "blob", true);
    } else {
      mode = "40000";
      hash = writeTree(pathName);
    }
    // const entryHashContent = Buffer.concat([
    //     Buffer.from(`${mode} ${entry.name}\0`),
    //     Buffer.from(hash, 'hex')
    // ])
    // treeBuffer = Buffer.concat([treeBuffer, entryHashContent]);
    entriesArray.push({
      mode: mode,
      hash: hash,
      name: entry.name,
    });
  }
  entriesArray.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
  for (const entry of entriesArray) {
    const entryHashContent = Buffer.concat([
      Buffer.from(`${entry.mode} ${entry.name}\0`),
      Buffer.from(entry.hash, "hex"),
    ]);
    treeBuffer = Buffer.concat([treeBuffer, entryHashContent]);
  }
  return generateHash(treeBuffer, "tree", true);
}

//commit-tree
export function commitTree(args: string[]) {
  let treeSha = args[1];
  let parSha = args[3];
  let message = args[5];
  let bf = Buffer.concat([
    Buffer.from(`tree ${treeSha}\n`),
    Buffer.from(`parent ${parSha}\n`),
    Buffer.from(`author <author@gmail.com> ${Date.now()} +0000\n`),
    Buffer.from(`commiter <author@gmail.com> ${Date.now()} +0000\n\n`),
    Buffer.from(`${message}\n`),
  ]);
  //   let header = Buffer.from(`commit ${bf.length}\0`);
  //   bf = Buffer.concat([header, bf]);
  //   let sha = crypto.createHash("sha1").update(bf).digest("hex");
  //   let dName = sha.substring(0, 2);
  //   let fName = sha.substring(2);
  //   let compressed = zlib.deflateSync(bf);
  //   fs.mkdirSync(`.git/objects/${dName}`);
  //   fs.writeFileSync(`.git/objects/${dName}/${fName}`, compressed);

  let sha = generateHash(bf, "commit", true);
  process.stdout.write(sha);
}
