import { fetchFile } from "@ffmpeg/ffmpeg";
import {
  AppNotification,
  AppNotificationType,
} from "../components/subcomponents/notification/notification";
import { setTaskStatus, waitTaskEnd } from "../default";
import Ffmpeg from "./ffmpeg";

import { FileHandler } from "./fileHandler";

export async function getThumbnails(
  files: FileHandler[]
): Promise<FileHandler[]> {
  const ffmpeg = await Ffmpeg();
  let msg = new AppNotification({
    title: "Thumbnail task",
    text: "wait for task.",
    type: AppNotificationType.progress,
  });
  msg.show();
  await waitTaskEnd();
  setTaskStatus(true);
  msg.text = "Loading thumbnails";
  msg.show();
  for await (const file of files) {
    if (file.thumbnail === undefined) {
      ffmpeg.FS("writeFile", file.file.name, await fetchFile(file.file));
      await ffmpeg.run(
        "-ss",
        "4",
        "-i",
        file.file.name,
        "-q:v",
        "20",
        "-vframes",
        "1",
        "output.jpg"
      );

      try {
        var img = ffmpeg.FS("readFile", "output.jpg");
        ffmpeg.FS("unlink", "output.jpg");
        file.thumbnail = URL.createObjectURL(
          new Blob([img.buffer], { type: "image/jpg" })
        );
      } catch {
        file.thumbnail = "/images/video-icon.png";
      }
      ffmpeg.FS("unlink", file.file.name);
    }
  }
  setTaskStatus(false);
  msg.delete();
  return files;
}

export async function getVideoLength(files: FileHandler[]) {
  for (let file of files) {
    let url = URL.createObjectURL(file.file);
    let v = document.createElement("video");
    v.src = url;
    let len = 0;
    await (async () => {
      return new Promise((res) => {
        v.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          len = v.duration;
          return res(v.duration);
        };
      });
    })();
    file.length = len;
  }
  return files;
}

export async function RunFFpeg(file: File, ...args: string[]) {
  const logger = new EventTarget();
  const ffmpeg = await Ffmpeg();
  await waitTaskEnd();
  setTaskStatus(true);
  ffmpeg.setLogger((l) => {
    logger.dispatchEvent(new CustomEvent("log", { detail: l }));
  });
  let logs: { type: string; msg: string }[] = [];
  let _d = (e: any) => {
    logs.push({ type: e.detail.type, msg: e.detail.message });
  };
  logger.addEventListener("log", _d);
  ffmpeg.FS("writeFile", file.name, await fetchFile(file));
  await ffmpeg.run(...args);
  logger.removeEventListener("log", _d);
  ffmpeg.FS("unlink", file.name);
  setTaskStatus(false);
  return logs;
}

export async function get_file_info(file: File) {
  const data = await RunFFpeg(
    file,
    "-hide_banner",
    "-v",
    "info",
    "-i",
    file.name,
    "-f",
    "ffmetadata"
  ).then((p) => p.slice(3, -3).map((i) => i.msg));
  return parse_result(data);
}
function parse_result(res: string[]) {
  console.log(res);
  let data: Array<any> = [];
  const file: any = {};
  file.codec_type = "File";
  let s_count = 0;
  for (let i = 0; i < res.length; i++) {
    let inp = /^Input\s#(\d*),\s((?:\w*|,)*)\sfrom\s'(.*)':$/.exec(res[i]);
    if (inp) {
      i++;
      file.name = inp[3];
      file.file_type = inp[2].slice(0, -1);
      for (; i < res.length; i++) {
        if (/^\s{2}Metadata:$/.test(res[i])) {
          i++;
          for (; i < res.length; i++) {
            if (!/^\s{4}/.test(res[i])) break;
            if (file["tags"] === undefined) file["tags"] = {};
            let encoder = /^\s{4}([\w\s]*)\s*:\s*(.+)$/.exec(res[i]);
            if (encoder) file["tags"][encoder[1]] = encoder[2];
          }
        }
        let duration =
          /^\s{2}Duration:\s([\d:.]+),\sstart:\s([\d:.]+),\sbitrate:\s([\w\d\s/]+)/.exec(
            res[i]
          );
        if (duration) {
          file.start = duration[2];
          file.duration = duration[1];
          file.bitrate = duration[3];
        }
        let chapter =
          /^\s{4}Chapter\s#\d:(\d+):\sstart\s([\d.]+),\send\s([\d.]+)/.exec(
            res[i]
          );
        if (chapter) {
          if (!Array.isArray(file.chapters)) file.chapters = [];
          let c_data: any = {
            start: chapter[2],
            end: chapter[3],
          };
          if (/^\s{4}Metadata:$/.test(res[i + 1])) {
            i = i + 2;
            let title = /\s{6}title\s*:\s*(.*)/.exec(res[i]);
            if (title) {
              c_data.title = title[1];
            }
          }
          file.chapters.push(c_data);
        }
        if (/\s{4}Stream\s#/.test(res[i])) {
          for (let rgx = 0; rgx < stream_rgx.length; rgx++) {
            let rgx_test = stream_rgx[rgx].exec(res[i]);
            if (rgx_test) {
              s_count++;

              i++;
              let st_data: any = {};
              Object.assign(st_data, rgx_test.groups);
              st_data["tags"] = {};
              if (/\s{4}Metadata:/.test(res[i])) {
                i++;
                for (; i < res.length; i++) {
                  if (!/^\s{6}/.test(res[i])) break;

                  let tags = /^\s{6}([\w\s]*)\s*:\s*(.+)$/.exec(res[i]);
                  if (tags) st_data["tags"][tags[1]] = tags[2];
                }
              }
              data.push(st_data);
            }
          }
        }
      }
    }
  }
  file["stream_count"] = s_count;
  data = [file, ...data];
  console.log(data);
  return data as readonly any[];
}
let stream_rgx = [
  /\s{4}Stream\s#\d:(?<index>\d+)(?:\((?<lang>\w*)\))?:\s(?<codec_type>Video):\s(?<codec_name>\w+)\s(?:\((?<profile>\w+)\))?(?:\s?\([A-z0-9\s[\]]*(?:[\d\w\s/]+)\))*,\s(?<pix_fmt>\w+)(?:\((?:[\w]+,[\s\w/]+,\s)?(?<field_order>[\w\d,\s,/]+)\))?,\s(?<width>\d+)x(?<height>\d+)(?:,*\s\[?SAR\s(?<sample_aspect_ratio>[\d:]+)\sDAR\s(?<display_aspect_ratio>[\d:]+)\]?,\s(?<avg_frame_rate>[\d.]+)\sfps,\s[\d.]+\stbr,\s[\d\w]+\stbn,\s[\d\w.]+\stbc\s\(\w+\))?/,
  /\s{4}Stream\s#\d:(?<index>\d+)(?:\((?<lang>\w*)\))?:\s(?<codec_type>Audio):\s(?<codec_name>\w+)\s?(?:\((?<profile>[\w-]+)\))?(?:\s?\([\w/\s[\]]*\))*,\s(?:(?<sample_rate>\d+)\s?Hz),\s(?<channel_layout>[\w+.()]+),\s?(?<sample_fmt>\w+)(?:,\s(?:(?<bit_rate>\d+))\skb\/s)?/,
  /\s{4}Stream\s#\d:(?<index>\d+)(?:\((?<lang>\w*)\))?:\s(?<codec_type>Subtitle):\s(?<codec_name>\w+)\s?(?:\((?<profile>[\w-]+)\))?/,
];
