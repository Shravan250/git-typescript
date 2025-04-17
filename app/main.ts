import * as fs from "fs";
import zlib from "zlib";
import crypto from "crypto";
import { catFileCommand, hashObjectCommand, initCommand } from "./helper";
import { get } from "http";

const args = process.argv.slice(2);
const command = args[0];

enum Command {
  Init = "init",
  Catfile = "cat-file",
  HashObject = "hash-object",
  LsTree = "ls-tree",
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
  default:
    throw new Error(`Unknown command ${command}`);
}
