import * as fs from "fs";
import zlib from "zlib";
import crypto from "crypto";

const args = process.argv.slice(2);
const command = args[0];

enum Command {
  Init = "init",
  Catfile = "cat-file",
  HashObject = "hash-object",
}

//flags and file paths
const getFlags = () => args[1].slice(1).split("");
const getFilePath = () => args[2];

switch (command) {
  case Command.Init:
    // You can use print statements as follows for debugging, they'll be visible when running tests.
    // console.error("Logs from your program will appear here!");

    // Uncomment this block to pass the first stage
    fs.mkdirSync(".git", { recursive: true });
    fs.mkdirSync(".git/objects", { recursive: true });
    fs.mkdirSync(".git/refs", { recursive: true });
    fs.writeFileSync(".git/HEAD", "ref: refs/heads/main\n");
    console.log("Initialized git directory");
    break;

  case Command.Catfile:
    // const blobDir = args[2].substring(0, 2);
    // const blobFileName = args[2].substring(2);
    // const blob = fs.readFileSync(`.git/objects/${blobDir}/${blobFileName}`);
    // const decompressed = zlib.unzipSync(new Uint8Array(blob));
    // const nullByteIndex = decompressed.indexOf(0);
    // const blobContent = decompressed.subarray(nullByteIndex + 1).toString();
    // process.stdout.write(blobContent);

    //consise solution
    if (getFlags().includes("p")) {
      const file = fs.readFileSync(
        `.git/objects/${args[2].slice(0, 2)}/${args[2].slice(2)}`
      );
      const blob = zlib
        .unzipSync(new Uint8Array(file))
        .toString()
        .split("\0")[1];
      process.stdout.write(blob);
    }
    break;

  case Command.HashObject:
    const data = fs.readFileSync(getFilePath()) as unknown as Uint8Array;
    const metaData = Buffer.from(
      `blob ${data.length}\0`
    ) as unknown as Uint8Array;
    const content = Buffer.concat([metaData, data]) as unknown as Uint8Array;

    //hashing
    const hash = crypto.createHash("sha1").update(content).digest("hex");
    process.stdout.write(hash);

    if (getFlags().includes("w")) {
      const compressed = zlib.deflateSync(
        new Uint8Array(content)
      ) as unknown as Uint8Array;
      const dir = `.git/objects/${hash.slice(0, 2)}`;
      const objectPath = `${dir}/${hash.slice(2)}`;
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(objectPath, compressed);
    }

    break;
  default:
    throw new Error(`Unknown command ${command}`);
}
