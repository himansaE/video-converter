import { InstallerPrompt, setPortal } from "../../../default";
import {
  AppNotification,
  AppNotificationType,
} from "../../subcomponents/notification/notification";
import { NotificationIDs } from "../../subcomponents/notification/notificationID";
import { Portal } from "../../subcomponents/portal/portal";
import style from "../menubar/popup.module.css";
import IStyle from "./installer.module.css";
export function InstallerView() {
  return (
    <div className={style.con}>
      <h1 className={style.header}>Install as App</h1>
      <div className={style.data}>
        <div className={IStyle.head}>
          Reasons why you need to install this app.
        </div>
        <div className={IStyle.li}>Installing uses almost no storage.</div>
        <div className={IStyle.li}>To set as default Video Editor.</div>
        <div className={IStyle.li}>Use this app even you offline.</div>
        <div className={IStyle.li}>
          Provides a quick way to return to this app.
        </div>
        <div className={style.btn_g}>
          <div className={style.btn_no} onClick={() => setPortal(<></>)}>
            Close
          </div>
          <div
            className={style.btn}
            onClick={() => {
              if (InstallerPrompt?.type === "beforeinstallprompt") {
                InstallerPrompt?.prompt();
              } else {
                new AppNotification({
                  id: NotificationIDs.AppInstall,
                  type: AppNotificationType.timed,
                  title: "App Install",
                  text: "App isn't ready to install.",
                  timeout: 2000,
                }).show();
              }
            }}
          >
            Install
          </div>
        </div>
      </div>
    </div>
  );
}
export function showInstaller() {
  setPortal(
    <Portal closeable={true}>
      <InstallerView />
    </Portal>
  );
}
