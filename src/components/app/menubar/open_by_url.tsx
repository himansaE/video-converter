import { Component } from "react";
import { setPortal } from "../../../default";
import { cssClass } from "../../../utils/css";
import { humanFileSize, lerp } from "../../../utils/utils";
import { Input } from "../../subcomponents/input/input";
import { Portal } from "../../subcomponents/portal/portal";
import ProgressBar from "../../subcomponents/progressbar/progressbar";

import style from "./popup.module.css";

export async function open_by_url(): Promise<undefined | File> {
  return new Promise((res) => {
    return setPortal(<OpenByUrl res={res}></OpenByUrl>);
  });
}

enum DownloadStatus {
  input,
  downloading,
  done,
  error,
}
export class OpenByUrl extends Component<{ res: Function }> {
  state = {
    status: DownloadStatus.input,
    url: "",
    downloaded: 0,
    size: 0,
    speed: 0,
    type: undefined,
    name: undefined,
    progress: undefined,
  };
  l_time = 0;
  l_size = 0;
  file = undefined;
  xhr = new XMLHttpRequest();
  startDownload = () => {
    this.setState({ status: DownloadStatus.downloading });
    this.xhr.open("get", process.env.REACT_APP_cors_url + this.state.url);
    this.xhr.onprogress = (e) => {
      if (this.l_size === 0) this.l_size = e.loaded;
      if (this.l_time === 0) this.l_time = e.timeStamp;
      this.setState({
        size: e.total,
        downloaded: e.loaded,
        speed: Math.floor(
          lerp(
            this.state.speed || 0,
            (e.loaded - this.l_size) / (e.timeStamp - this.l_time),
            0.05
          )
        ),
        progress: (this.state.downloaded / this.state.size) * 100 || undefined,
      });
      this.l_size = e.loaded;
      this.l_time = e.timeStamp;
    };
    this.xhr.onreadystatechange = (e) => {
      if (this.xhr.readyState === 2) {
        if (!this.state.type)
          this.setState({
            type: this.xhr.getResponseHeader("content-type") || ".",
          });
        if (!this.state.name) {
          let filename = /filename[^;\n=]*=((['"]).*?\2|[^;\n]*)/.exec(
            this.xhr.getResponseHeader("Content-Disposition") ?? ""
          );
          if (filename === null) {
            filename = /[^/\\&?]+\.\w{3,4}(?=([?&].*$|$))/.exec(
              this.state.url ?? ""
            );
          }
          if (filename !== null) {
            this.setState({ name: filename[0] ?? "unknown Video" });
          }
        }
      }
    };
    this.xhr.onerror = (e) => {
      this.setState({ status: DownloadStatus.error });
    };
    this.xhr.onload = (e) => {
      this.setState({
        status: DownloadStatus.done,
        speed: undefined,
        progress: undefined,
      });
      setPortal(<></>);
      this.props.res(
        new File([this.xhr.response], this.state.name ?? "Untitled File.mp4", {
          type: this.state.type,
        })
      );
    };
    this.xhr.responseType = "arraybuffer";
    this.xhr.send();
  };

  Body = () => {
    switch (this.state.status) {
      case DownloadStatus.input:
        return (
          <>
            <div className={style.w_text}>
              File need to download first. Data cost maybe applied.
            </div>
            <form>
              <Input
                value={this.state.url}
                setValue={(e: string) => {
                  this.setState({ url: e });
                }}
                placeHolder="Input video URL"
                autoFocus={true}
              />
              <div className={style.btn_g}>
                <div className={style.btn_no} onClick={() => setPortal(<></>)}>
                  close
                </div>
                <button
                  className={style.btn}
                  onClick={() => {
                    this.startDownload();
                  }}
                >
                  open
                </button>
              </div>
            </form>
          </>
        );
      case DownloadStatus.done:
      case DownloadStatus.downloading:
        return (
          <>
            <div className={style.txt}>
              {this.state.status === DownloadStatus.downloading
                ? "Downloading File"
                : "Loading File"}
            </div>
            <div className={style.p_data}>
              <div className={style.p_info}>
                <table className={style.table}>
                  <tbody>
                    <tr>
                      <td>File Name</td>
                      <td>{this.state.name}</td>
                    </tr>
                    <tr>
                      <td>File type</td>
                      <td>{this.state.type}</td>
                    </tr>
                    <tr>
                      <td>Downloaded</td>
                      <td>{humanFileSize(this.state.downloaded)}</td>
                    </tr>
                    <tr>
                      <td>File Size</td>
                      <td>{humanFileSize(this.state.size)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className={style.progress}>
                <ProgressBar progress={this.state.progress} />
                <div className={style.p_bar}>
                  <div className={style.percent}>
                    {this.state.progress ? Math.floor(this.state.progress) : ""}
                    {this.state.progress ? "%" : ""}
                  </div>
                  <div className={style.speed}>
                    {this.state.speed || ""}
                    {this.state.speed ? "KBps" : ""}
                  </div>
                </div>
              </div>
            </div>
            <div className={style.btn_g} style={{ margin: "10px 10px 2px" }}>
              <div
                className={cssClass(
                  style.btn,
                  this.state.status === DownloadStatus.done ? style.btn_d : ""
                )}
                onClick={() => {
                  if (this.state.status === DownloadStatus.downloading) {
                    this.xhr.abort();
                    setPortal(<></>);
                  }
                }}
              >
                Cancel
              </div>
            </div>
          </>
        );

      case DownloadStatus.error:
        return (
          <>
            <div className={style.w_text}>Error while downloading File.</div>
            <div className={style.btn_g}>
              <div className={style.btn_no} onClick={() => setPortal(<></>)}>
                Cancel
              </div>
              <div
                className={style.btn}
                onClick={() => {
                  this.startDownload();
                }}
              >
                Retry
              </div>
            </div>
          </>
        );
    }
    return <></>;
  };

  render() {
    return (
      <Portal
        closeable={this.state.status === DownloadStatus.input ? true : false}
      >
        <div className={style.con}>
          <h1 className={style.header}>Open File by URL</h1>
          <div className={style.data}>
            <this.Body />
          </div>
        </div>
      </Portal>
    );
  }
}
