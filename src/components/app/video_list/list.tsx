import listStyle from "./list.module.css";
import { formatTime } from "../../../utils/utils";
import { FileHandler } from "../../../utils/fileHandler";
import { cssClass } from "../../../utils/css";
export function VideoList(props: {
  files: FileHandler[];
  selectVideo: Function;
  selected?: number;
}) {
  return (
    <div className={listStyle.v_list}>
      {props.files.map((i) => (
        <div
          key={i.id}
          className={cssClass(
            listStyle.v_list_item,
            i.id === props.selected ? listStyle.v_list_item_s : ""
          )}
          onClick={() => {
            props.selectVideo(i);
          }}
        >
          {i.id === props.selected ? (
            <div className={listStyle.v_list_selected_i}></div>
          ) : (
            <></>
          )}
          <div
            style={{
              backgroundImage: `url(${
                i.thumbnail ?? require("../../../images/video-icon.png").default
              })`,
            }}
            className={listStyle.v_thumbnail}
          />
          <div className={listStyle.v_details}>
            <div className={listStyle.v_name}>{i.file.name}</div>
            <div className={listStyle.v_duration}>
              {!!i.length ? formatTime(i.length) : ""}
            </div>
            {/* <ProgressBar progress={i.progress}></ProgressBar> */}
          </div>
        </div>
      ))}
    </div>
  );
}
