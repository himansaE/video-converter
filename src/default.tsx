import React, { ReactElement } from "react";
import "./App.css";
import { App } from "./components/app/app";
import Main from "./components/main/main";
import NotificationRender, {
  AppNotification,
  AppNotificationType,
} from "./components/subcomponents/notification/notification";
import { NotificationIDs } from "./components/subcomponents/notification/notificationID";
import { FileHandler } from "./utils/fileHandler";

export enum AppState {
  empty,
  load,
  loading,
}
interface appState {
  state: AppState;
  filesList: FileHandler[];
  settings: any;
  appTask: boolean;
  portal: ReactElement;
}

let TaskStatus = false;
export let InstallerPrompt: any;
export const getTaskStatus = () => TaskStatus;
export const waitTaskEnd = async () => {
  return new Promise((res) => {
    if (!TaskStatus) res("");
    let t = window.setInterval(() => {
      if (!TaskStatus) {
        clearInterval(t);
        res("");
      }
    }, 200);
  });
};
export let setTaskStatus: (inTask: boolean) => void;

export let setPortal: (p: ReactElement) => void;

class Default extends React.Component<any, appState> {
  constructor(props: any) {
    super(props);
    this.state = {
      state: AppState.empty,
      filesList: [],
      settings: {},
      appTask: false,
      portal: <></>,
    };
    this.setAppState = this.setAppState.bind(this);
    this.setFileList = this.setFileList.bind(this);
    this.setAppTask = this.setAppTask.bind(this);
    setTaskStatus = this.setAppTask.bind(this);
    setPortal = this.createPortal.bind(this);
  }

  componentDidMount() {
    let per_render = document.getElementById("per-render");
    per_render?.remove();
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      InstallerPrompt = e;
      return;
    });
    navigator.serviceWorker?.ready.then((r) => {
      r.addEventListener("updatefound", () => {
        let update = r.installing;
        let msg = new AppNotification({
          type: AppNotificationType.progress,
          id: NotificationIDs.AppInstall,
          title: "App Update",
          text: "Downloading new Update.",
        });
        msg.show();
        update?.addEventListener("statechange", () => {
          if (update?.state === "installed") {
            msg.type = AppNotificationType.action;
            msg.text =
              "Update is Ready to Install. Update will reload the page.";
            msg.actions = [
              {
                name: "Install",
                task: () => {
                  update?.postMessage({ type: "SKIP_WAITING" });
                  navigator.serviceWorker.addEventListener(
                    "controllerchange",
                    () => {
                      window.location.reload();
                    }
                  );
                },
              },
            ];
            msg.show();
          }
        });
      });
    });
  }
  setAppState(appState: AppState, files: FileHandler[]) {
    this.setState({
      state: appState,
      filesList: files,
    });
  }
  createPortal = (p: ReactElement) => {
    this.setState({ portal: p });
  };
  setFileList(file_list: FileHandler[]) {
    this.setState({ filesList: file_list });
  }
  setAppTask(inTask: boolean) {
    this.setState({ appTask: inTask });
    TaskStatus = inTask;
  }
  render() {
    return (
      <div className="App">
        {[AppState.empty, AppState.loading].includes(this.state.state) ||
        this.state.filesList.length === 0 ? (
          <Main AppStateSetter={this.setAppState} />
        ) : (
          <App
            files={this.state.filesList}
            setFileList={this.setFileList}
            inTask={this.state.appTask}
            // setAppTask={this.setAppTask}
          />
        )}
        <NotificationRender />
        <div id="portal">{this.state.portal}</div>
      </div>
    );
  }
}

export default Default;
