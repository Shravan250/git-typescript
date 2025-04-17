const args = ["cat-file", "-p", "e8tyutriegthehrhehdjtjdjejwkekrltieowuri"];

const blobDir = args[2].slice(0, 2);
const blobFileName = args[2].slice(2);

const blob = "blob 11\0hello world";
const content = blob.split("\0")[1];
//["blob 11", "hello world"]

console.log("blobDir: ", blobDir);
console.log("blobFileName: ", blobFileName);
console.log("content: ", content);
