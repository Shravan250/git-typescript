import * as fs from "fs";
import zlib from "zlib";

const args = process.argv.slice(2);
const command = args[0];

enum Command {
  Init = "init",
  Catfile = "cat-file",
}

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
    const flag = args[1];
    if (flag == "-p") {
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

  default:
    throw new Error(`Unknown command ${command}`);
}
