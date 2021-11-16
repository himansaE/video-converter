import React, { Component } from "react";
import { AppState } from "../../default";
import { cssClass, cssVariable } from "../../utils/css";
import Ffmpeg from "../../utils/ffmpeg";
import { createFileHandler, FileHandler } from "../../utils/fileHandler";
import { blockReload } from "../app/app";
import { RunFFpeg } from "../../utils/getVideoDetail";
import {
  AppNotification,
  AppNotificationType,
} from "../subcomponents/notification/notification";

interface MainPageState {
  appState: AppState;
  drag_over: boolean;
  loadStatus: MainLoadState[];
}
interface MainLoadState {
  id: string;
  mass: string;
  done: boolean;
}
interface MainPageProps {
  AppStateSetter: (appState: AppState, files: FileHandler[]) => void;
}
export default class Main extends Component<MainPageProps, MainPageState> {
  constructor(props: MainPageProps) {
    super(props);
    this.state = {
      appState: AppState.empty,
      drag_over: false,
      loadStatus: [{ id: "", mass: "", done: false }],
    };
  }

  //check files with ffmpeg
  loadFiles = async (files: File[]) => {
    window.addEventListener("beforeunload", blockReload);
    let msg = new AppNotification({
      title: "File task",
      timeout: 1500,
      type: AppNotificationType.timed,
      text: "no video files selected. ",
    });
    if (files.length === 0) {
      msg.show();
      return;
    }
    this.setState({
      appState: AppState.loading,
      loadStatus: [{ id: "", mass: "", done: false }],
    });
    const filesList: FileHandler[] = [];

    this.setMassage("load-ff", false, "Loading Modules");
    try {
      await Ffmpeg();
    } catch (_) {
      console.log("error loading ffmpeg.");
      new AppNotification({
        type: AppNotificationType.timed,
        title: "Download Error",
        text: !navigator.onLine
          ? "No Internet connection. Retry after connected to Internet."
          : "Something went wrong. Retry.",
        timeout: 2500,
      }).show();
      this.setState({
        appState: AppState.empty,
        loadStatus: [{ id: "", mass: "", done: false }],
      });
      window.removeEventListener("beforeunload", blockReload);
      return;
    }
    this.setMassage("load-ff", true);

    for await (let file of files) {
      this.setMassage("load-" + file.name, false, `checking ${file.name}`);
      let logs = await RunFFpeg(
        file,
        "-v",
        "error",
        "-sseof",
        "-5",
        "-i",
        file.name
      );

      if (logs[2].msg === "At least one output file must be specified") {
        filesList.push(createFileHandler({ file: file }));
      }
      this.setMassage("load-" + file.name, true);
    }
    if (filesList.length === 0) {
      this.setState({
        appState: AppState.empty,
        loadStatus: [{ id: "", mass: "", done: false }],
      });
      window.removeEventListener("beforeunload", blockReload);
      return msg.show();
    }
    window.removeEventListener("beforeunload", blockReload);
    this.props.AppStateSetter(AppState.load, filesList);
  };

  setMassage = (id: string, done: boolean, msg?: string) => {
    if (id === "") return;
    let index = this.state.loadStatus.findIndex((i) => i.id === id);
    if (index === -1)
      return this.setState({
        loadStatus: [
          ...this.state.loadStatus,
          { mass: msg ?? "", id: id, done: done },
        ],
      });
    let _state = this.state.loadStatus;
    _state[index].done = done;
    _state[index].mass = msg || _state[index].mass;
    this.setState({ loadStatus: _state });
  };
  render() {
    return (
      <div className="main-page">
        <header className="App-header">
          <h1 className="main-head">Online Video Info</h1>
        </header>
        <div className="drop_con">
          <label
            className={cssClass(
              "drop_con_l",
              this.state.appState === AppState.empty ? "" : "drop_con_lo"
            )}
          >
            <div className="drop_outer">
              {this.state.appState === AppState.empty ? (
                <>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    multiple={true}
                    onChange={(e) => {
                      if (e.target.files)
                        this.loadFiles(
                          ((files: FileList) => {
                            let file_arr: File[] = [];
                            for (let f = 0; f < files.length; f++) {
                              if (files[f].type.includes("video")) {
                                file_arr.push(files[f]);
                              }
                            }
                            return file_arr;
                          })(e.target.files)
                        );
                    }}
                  />
                  <div
                    className="upload_con"
                    onDrop={(e) => {
                      let is_vid = false;
                      let files: File[] = [];
                      for (let f = 0; f < e.dataTransfer.items.length; f++) {
                        if (e.dataTransfer.items[f].type.includes("video")) {
                          is_vid = true;
                          files.push(e.dataTransfer.files[f]);
                        }
                      }
                      if (!is_vid) return this.setState({ drag_over: false });
                      e.preventDefault();
                      this.setState({ drag_over: false });
                      this.loadFiles(files);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      let is_vid = false;
                      for (let f = 0; f < e.dataTransfer.items.length; f++) {
                        if (e.dataTransfer.items[f].type.includes("video")) {
                          is_vid = true;
                        }
                      }
                      if (!is_vid) return this.setState({ drag_over: false });
                      this.setState({ drag_over: true });
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      this.setState({ drag_over: false });
                    }}
                  >
                    <div className="upload_icon">
                      <svg
                        viewBox="0 0 64 64"
                        fill="none"
                        className={this.state.drag_over ? "drag_svg" : ""}
                      >
                        <g id="svg_upload_g">
                          <path
                            id="svg_upload_1"
                            d="M16 20L31 3L46 19M31 48V3V48Z"
                          />
                          <path
                            id="svg_upload_2"
                            d="M8 46V51C8 57.0751 12.9249 62 19 62H43C49.0751 62 54 57.0751 54 51V46"
                          />
                        </g>
                      </svg>
                    </div>
                    <div className="upload_icon_text">
                      Drop {this.state.drag_over ? "here" : "or Select"}
                    </div>
                  </div>
                </>
              ) : (
                <div className="main-loading">
                  <svg className="main-anim-c">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="gary"
                      strokeWidth="6"
                    ></circle>
                  </svg>
                  <div className="main-loading-text">Loading file.</div>
                  <div
                    className="upload_status"
                    style={cssVariable({
                      "--item-count": (this.state.loadStatus.length - 2) * -1,
                    })}
                  >
                    {this.state.loadStatus.map((i, n) => {
                      if (n === 0) return <div key={i + "n"}></div>;
                      return (
                        <div className="upload_s_item" key={n + "a"}>
                          {i.done ? (
                            <>
                              <div className="u_circle">
                                <svg viewBox="0 0 24 24">
                                  <path
                                    fill="currentColor"
                                    d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
                                  />
                                </svg>
                              </div>
                              <div className="upload_s_text">{i.mass}</div>
                            </>
                          ) : (
                            <>
                              <div className="u_circle_l">
                                <svg>
                                  <circle
                                    cx="7"
                                    cy="7"
                                    r="6"
                                    fill="none"
                                    stroke="gary"
                                    strokeWidth="2"
                                  ></circle>
                                </svg>
                              </div>
                              <div className="upload_s_text">{i.mass}</div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>
    );
  }
}
