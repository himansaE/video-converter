import codec_names from "../../../utils/ffmpeg/codecs.json";
import pix_formats from "../../../utils/ffmpeg/pix_format.json";
import field_order from "../../../utils/ffmpeg/field_order.json";
import channel_layout from "../../../utils/ffmpeg/channel_layouts.json";
import { Input } from "../../subcomponents/input/input";
import { Select } from "../../subcomponents/input/select";
export function VideoInfoInput(props: {
  info: string;
  value: string;
  codec_type: string;
  path: string;
}) {
  if (props.info === "codec_name")
    return (
      <Select
        values={codec_names[matchCodecType(props.codec_type)]}
        default={codec_names[matchCodecType(props.codec_type)].findIndex(
          (i) => i === props.value
        )}
        default_name={props.value}
      />
    );
  if (props.info === "pix_fmt" && props.codec_type === "Video")
    return (
      <Select
        values={pix_formats}
        default={pix_formats.findIndex((i) => i === props.value)}
        default_name={props.value}
      />
    );
  if (props.info === "field_order" && props.codec_type === "Video")
    return (
      <Select
        values={field_order}
        default={field_order.findIndex((i) => i === props.value)}
        default_name={props.value}
      />
    );
  if (props.info === "channel_layout" && props.codec_type === "Audio")
    return (
      <Select
        values={channel_layout}
        default={channel_layout.findIndex((i) => i === props.value)}
        default_name={props.value}
      />
    );
  return (
    <Input
      value={props.value}
      disabled={
        props.path.split("...").length > 1 ||
        editable.indexOf(props.info) === -1
          ? true
          : false
      }
    />
  );
}

function matchCodecType(s: string): keyof typeof codec_names {
  switch (s) {
    case "Video":
      return "video";
    case "Audio":
      return "audio";
    case "Subtitle":
      return "sub";
    default:
      return "sub";
  }
}

const editable = [
  "name",
  "avg_frame_rate",
  "display_aspect_ratio",
  "height",
  "width",
  "sample_rate",
];
