function getHash(input: string) {
  var hash = 0;
  for (var i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // to 32bit integer
  }
  return parseInt(
    `${Date.now().toString().slice(-6)}${hash.toString()}`.replace("-", "")
  );
}

function formatTime(t: number) {
  return (
    (t > 86400000 ? Math.floor(t / 86400000) + ":" : "") +
    new Date(t * 1000).toISOString().slice(11, 19)
  );
}

function humanFileSize(size: number) {
  if (size < 1024) return size + " B";
  let i = Math.floor(Math.log(size) / Math.log(1024));
  let num = size / Math.pow(1024, i);
  let round = Math.round(num);
  return `${
    round < 10 ? num.toFixed(2) : round < 100 ? num.toFixed(1) : round
  } ${"KMGTPEZY"[i - 1]}B`;
}
function lerp(v0: number, v1: number, t: number) {
  return v0 * (1 - t) + v1 * t;
}

function download(url: string, name: string, expire?: boolean) {
  let a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  if (expire) {
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);
  }
}
function removeFromArray(a: Array<any>, index: number) {
  return a.filter((i, n) => n !== index);
}
export { getHash, formatTime, humanFileSize, lerp, download, removeFromArray };
