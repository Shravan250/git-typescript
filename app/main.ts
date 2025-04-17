import {
  catFileCommand,
  hashObjectCommand,
  initCommand,
  lsTreeCommand,
  writeTreeForFolder,
} from "./helper";

const args = process.argv.slice(2);
const command = args[0];

enum Command {
  Init = "init",
  Catfile = "cat-file",
  HashObject = "hash-object",
  LsTree = "ls-tree",
  writeTree = "write-tree",
}

//flags and file paths
const getFlags = () => args[1].slice(1).split("");
const getFilePath = () => args[2];

switch (command) {
  case Command.Init:
    initCommand();
    break;

  case Command.Catfile:
    if (getFlags().includes("p")) {
      catFileCommand(args[2]);
    }
    break;

  case Command.HashObject:
    if (getFlags().includes("w")) {
      hashObjectCommand(getFilePath());
    }
    break;

  case Command.LsTree:
    lsTreeCommand(args[2]);
    break;

  case Command.writeTree:
    const hash = await writeTreeForFolder(".");
    process.stdout.write(hash);
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}
