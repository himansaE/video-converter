import { Component } from "react";
import { cssClass, cssVariable } from "../../utils/css";
import { FileHandler, MetadataLoadState } from "../../utils/fileHandler";
import {
  getThumbnails,
  getVideoLength,
  get_file_info,
} from "../../utils/getVideoDetail";
import { doMenuTask } from "./menubar/eventActions";
import { MenuBar } from "./menubar/menubar";

import videoStyle from "./video.module.css";
import { VideoDetail } from "./video_details/video_details";
import { VideoList } from "./video_list/list";

interface AppPageProps {
  files: FileHandler[];
  setFileList: (file_list: FileHandler[]) => void;
  inTask: boolean;
}
interface AppPageState {
  selected?: number;
  pageXOffset?: number;
  pageYOffset?: number;
}
export function blockReload(e: BeforeUnloadEvent) {
  if (process.env.NODE_ENV === "production") {
    e.preventDefault();
    e.returnValue = "you will loose your data";
    return "you will loose your data";
  }
}
class App extends Component<AppPageProps, AppPageState> {
  state = {
    selected: undefined,
    pageXOffset: undefined,
    pageYOffset: undefined,
  };
  constructor(props: AppPageProps) {
    super(props);
    this.selectVideo = this.selectVideo.bind(this);
    this.loadFileInfo = this.loadFileInfo.bind(this);
  }
  eventTarget = new EventTarget();
  runMenuTask = (e: any) => {
    doMenuTask(e.detail.task, this.props.files, {
      setFiles: this.props.setFileList,
      setFileData: this.setFileState,
      selected: this.state.selected,
      select: this.selectVideo,
      loadInfo: this.loadFileInfo,
    });
  };
  componentDidMount() {
    this.eventTarget.addEventListener("menubar", this.runMenuTask);
    this.selectVideo = this.selectVideo.bind(this);
    this.setFileState = this.setFileState.bind(this);
    this.selectVideo(this.props.files[0]);
    this.loadDetails();
    window.addEventListener("beforeunload", blockReload);
  }
  componentWillUnmount() {
    URL.revokeObjectURL(
      this.props.files.find((i) => i.id === this.state.selected)?.data_url ?? ""
    );
    window.removeEventListener("beforeunload", blockReload);
  }

  async loadDetails() {
    this.updateThumbnail();
    this.updateVideoDuration();
  }
  async updateThumbnail() {
    const thumbnails = await getThumbnails(this.props.files);
    this.setFileState(thumbnails);
  }

  async updateVideoDuration() {
    const files = await getVideoLength(
      this.props.files.filter((i) => i.length === undefined)
    );
    this.setFileState(files);
  }
  async loadFileInfo(file: FileHandler) {
    if (!file) return;
    file.metadata = await get_file_info(file.file);
    file.metadataState = MetadataLoadState.true;
    this.setFileState([file]);
  }

  setFileState(files: FileHandler[]) {
    let f_list = this.props.files;
    f_list = f_list.map((f) => {
      for (let i of f_list) {
        if (f.id === i.id) f = i;
      }
      return f;
    });
    this.props.setFileList(f_list);
  }
  findIndexById(id: number) {
    return this.props.files.findIndex((i) => i.id === id);
  }
  findFileById(id: number): FileHandler {
    return this.props.files[this.findIndexById(id)];
  }
  selectVideo(file: FileHandler) {
    if (this.state.selected === file.id) return;
    //get selected video
    if (this.state.selected) {
      let old_f = this.findFileById(this.state.selected);
      URL.revokeObjectURL(old_f.data_url ?? "");
      old_f.is_data_loaded = false;
      this.setFileState([old_f]);
    }
    file.data_url = URL.createObjectURL(file.file);
    file.is_data_loaded = true;
    this.setFileState([file]);
    this.setState({ selected: file.id });
  }
  divider_drag(
    ev: React.MouseEvent<HTMLDivElement, MouseEvent>,
    func: Function
  ) {
    const elem = ev.currentTarget;
    let _f = (ev: MouseEvent) => {
      elem.classList.add(videoStyle.app_hv_divider_i_hover);
      func(ev);
    };
    window.addEventListener("mousemove", _f);
    window.addEventListener(
      "mouseup",
      () => {
        window.removeEventListener("mousemove", _f);
        elem.classList.remove(videoStyle.app_hv_divider_i_hover);
      },
      { once: true }
    );
  }

  render() {
    return (
      <div className={videoStyle.app}>
        <MenuBar eventTarget={this.eventTarget} inTask={this.props.inTask} />
        <div
          className={videoStyle.video_con}
          style={cssVariable({
            "--v-con-height": (this.state.pageXOffset ?? 10000) + "px",
          })}
        >
          {!!this.state.selected ? (
            <div className={videoStyle.v_con}>
              <div
                className={videoStyle.detail_con}
                style={{
                  minWidth: `max(min(${
                    this.state.pageYOffset
                      ? this.state.pageYOffset + "px"
                      : "50vw"
                  },calc(100vw - var(--detail-con-min-width))), var(--detail-con-min-width))`,
                }}
              >
                <div className={videoStyle.v_d_con}>
                  {this.findFileById(this.state.selected).metadataState ===
                  MetadataLoadState.true ? (
                    <VideoDetail
                      file={
                        this.props.files[
                          this.props.files.findIndex(
                            (i) => i.id === this.state.selected
                          )
                        ]
                      }
                      setFileState={this.setFileState}
                    />
                  ) : (
                    <div className={videoStyle.v_d_con_not_loaded}>
                      {this.findFileById(this.state.selected).metadataState ===
                      MetadataLoadState.false ? (
                        <>
                          <h3 className={videoStyle.v_d_load_text}>
                            video metadata is not loaded
                          </h3>
                          <div
                            className={videoStyle.button}
                            onClick={() => {
                              let f = this.findFileById(
                                this.state.selected ?? 0
                              );
                              f.metadataState = MetadataLoadState.loading;
                              this.loadFileInfo(f);
                              this.setFileState([f]);
                            }}
                          >
                            Load
                          </div>
                        </>
                      ) : (
                        <div className={videoStyle.loading_meta}>
                          <svg
                            viewBox="0 0 44 44"
                            role="status"
                            className={videoStyle.loader_circle}
                          >
                            <circle
                              cx="22"
                              cy="22"
                              r="20"
                              fill="none"
                              strokeWidth="4"
                            ></circle>
                          </svg>
                          <div className={videoStyle.loading_meta_text}>
                            Loading metadata
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div
                className={cssClass(
                  videoStyle.app_v_divider,
                  videoStyle.app_divider
                )}
                onMouseDown={(e) => {
                  this.divider_drag(e, (ev: MouseEvent) => {
                    this.setState({
                      pageYOffset: ev.clientX,
                    });
                  });
                }}
              >
                <div
                  className={cssClass(
                    videoStyle.app_v_divider_i,
                    videoStyle.app_divider_i
                  )}
                ></div>
              </div>
              <div className={videoStyle.v_box_con}>
                <div className={videoStyle.v_box}>
                  <video
                    className={videoStyle.video}
                    src={this.findFileById(this.state.selected).data_url}
                    controls={true}
                  ></video>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
        <div
          className={cssClass(videoStyle.app_h_divider, videoStyle.app_divider)}
          onMouseDown={(e) => {
            this.divider_drag(e, (ev: MouseEvent) => {
              this.setState({
                pageXOffset: ev.clientY,
              });
            });
          }}
        >
          <div
            className={cssClass(
              videoStyle.app_h_divider_i,
              videoStyle.app_divider_i
            )}
          ></div>
        </div>
        <VideoList
          files={this.props.files}
          selectVideo={this.selectVideo}
          selected={this.state.selected}
        />
      </div>
    );
  }
}

export { App };
