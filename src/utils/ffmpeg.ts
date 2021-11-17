import { createFFmpeg } from "@ffmpeg/ffmpeg";

export const ffmpeg_path = "../../utils/ffmpeg/ffmpeg-core.js";
const _ffmpeg = createFFmpeg({
  log: true,
  corePath: ffmpeg_path,
});

_ffmpeg.setLogging(false);
async function Ffmpeg() {
  if (_ffmpeg.isLoaded()) {
    return _ffmpeg;
  }
  await _ffmpeg.load();
  return _ffmpeg;
}
export default Ffmpeg;
