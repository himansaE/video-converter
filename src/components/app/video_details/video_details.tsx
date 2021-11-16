import React from "react";
import { cssClass } from "../../../utils/css";
import { FileHandler } from "../../../utils/fileHandler";
import style from "./vd.module.css";
import { VideoInfoInput } from "./video_info_input";
export function VideoDetail(props: {
  file: FileHandler;
  setFileState: (files: FileHandler[]) => void;
}) {
  return (
    <div className={style.con}>
      <h1 className={style.header}>File Info</h1>
      <div className={style.data}>
        {props.file.metadata === undefined ? (
          <>something wrong while reading metadata</>
        ) : (
          <>
            <div className={style.stream_list}>
              {props.file.metadata?.map((i: any, n: number) => (
                <div
                  key={n}
                  className={cssClass(
                    style.stream_list_item,
                    props.file?.activeTab === n ? style.stream_list_item_ac : ""
                  )}
                  onClick={() => {
                    let f = props.file;
                    f.activeTab = n;
                    props.setFileState([f]);
                  }}
                >
                  {i.codec_type}
                </div>
              ))}
            </div>
            <div className={style.stream_data_list}>
              {_create_e(
                props.file.metadata[props.file.activeTab],
                props.file.file.name + props.file.activeTab
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function _create_e(data: any, path: string): any {
  if (!data) return <></>;
  return Object.keys(data).map((t) => {
    if ("codec_type" === t || data[t] === undefined)
      return <React.Fragment key={path + t}></React.Fragment>;
    if (typeof data[t] === "object")
      return (
        <div
          key={path + t}
          className={cssClass(
            style.stream_data_item,
            path.split("...").length > 1
              ? style.stream_data_item_name_inside
              : ""
          )}
        >
          <div className={style.stream_data_item_name_inside}>
            {t.split("_").join(" ")}
          </div>
          {_create_e(data[t], `${path}...${t}`)}
        </div>
      );
    return (
      <div className={style.stream_data_item} key={path + t}>
        <div className={style.stream_data_item_name_inside}>
          {t.split("_").join(" ")}
        </div>

        <VideoInfoInput
          value={data[t]}
          path={path}
          codec_type={data["codec_type"]}
          info={t}
        />
      </div>
    );
  });
}
