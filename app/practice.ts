//@ts-nocheck

const args = ["cat-file", "-p", "e8tyutriegthehrhehdjtjdjejwkekrltieowuri"];

const blobDir = args[2].slice(0, 2);
const blobFileName = args[2].slice(2);

const blob = "blob 11\0hello world";
const content = blob.split("\0")[1];
//["blob 11", "hello world"]

console.log("blobDir: ", blobDir);
console.log("blobFileName: ", blobFileName);
console.log("content: ", content);

//lstree
const args = ["cat-file", "-p", "e8tyutriegthehrhehdjtjdjejwkekrltieowuri"];

//   tree <size>\0
//   <mode> <name>\0<20_byte_sha>
//   <mode> <name>\0<20_byte_sha>

const decompressed =
  "tree 49\u0000040000 dir1\u0000aaaaaaaaaaaaaaaaaaaa100644 file.txt\u0000dddddddddddddddddddd";

const treeContent = decompressed
  .toString()
  .split("\u0000")
  // [
  //   "tree 49",
  //   "040000 dir1",
  //   "aaaaaaaaaaaaaaaaaaaa100644 file.txt",
  //   "dddddddddddddddddddd"
  // ]
  .slice(1, -1)
  // [
  //   "040000 dir1",
  //   "aaaaaaaaaaaaaaaaaaaa100644 file.txt"
  // ]
  .reduce((acc, e) => [...acc, e.split(" ").at(-1)], [])
  // For "040000 dir1":
  // e.split(" ") returns ["040000", "dir1"].
  // .at(-1) returns "dir1".
  //
  // For "aaaaaaaaaaaaaaaaaaaa100644 file.txt":\
  // e.split(" ") returns ["aaaaaaaaaaaaaaaaaaaa100644", "file.txt"]
  // .at(-1) returns "file.txt".
  //
  // Result: The accumulator (acc) becomes:
  // ["dir1", "file.txt"]
  .join("\n");
// "dir1\nfile.txt"

console.log(treeContent);
