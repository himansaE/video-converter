/* eslint-disable @typescript-eslint/no-redeclare */

import { InstallerPrompt } from "../../../default";
import {
  createFileHandler,
  FileHandler,
  FileType,
  MetadataLoadState,
} from "../../../utils/fileHandler";
import {
  getThumbnails,
  getVideoLength,
  RunFFpeg,
} from "../../../utils/getVideoDetail";
import { download } from "../../../utils/utils";
import {
  AppNotification,
  AppNotificationType,
} from "../../subcomponents/notification/notification";
import { NotificationIDs } from "../../subcomponents/notification/notificationID";
import { showInstaller } from "../installer/installer";
import { open_by_url } from "./open_by_url";

export enum MenuTask {
  open_file,
  open_files,
  open_folder,
  open_url,
  remove_selected,
  close_app,
  rename_file,
  load_metadata,
  load_metadata_all,
  save_thumbnail,
  save_file,
  save_metadata,
  app_install,
  about,
}

export async function doMenuTask(
  task: MenuTask,
  files: FileHandler[],
  args: {
    setFiles: (file_list: FileHandler[]) => void;
    setFileData: (file_list: FileHandler[]) => void;
    selected?: number;
    select: (file: FileHandler) => void;
    loadInfo: (file: FileHandler) => Promise<void>;
  }
) {
  switch (task) {
    case MenuTask.open_file:
      await AddFile(task, args.setFiles, files);
      return;
    case MenuTask.open_files:
      await AddFile(task, args.setFiles, files);
      return;
    case MenuTask.open_folder:
      await AddFile(task, args.setFiles, files);
      return;
    case MenuTask.open_url:
      let file = await open_by_url();
      if (file === undefined) return;
      await FileTask([file], files, args.setFiles, true);
      return;
    case MenuTask.remove_selected:
      var selected = files.filter((i) => i.id === args.selected)[0];
      URL.revokeObjectURL(selected?.thumbnail ?? "");
      URL.revokeObjectURL(selected?.data_url ?? "");
      let _f = files.filter((i) => i.id !== args.selected);
      if (_f.length !== 0) args.select(_f[0]);
      args.setFiles(_f);
      return;
    case MenuTask.rename_file:
      let f = files.filter((i) => i.id === args.selected)[0];
      if (
        [MetadataLoadState.false, MetadataLoadState.loading].indexOf(
          f.metadataState
        ) !== -1
      ) {
        new AppNotification({
          text:
            f.metadataState === MetadataLoadState.false
              ? "Load metadata to rename."
              : "Wait for load metadata",
          title: "Rename",
          timeout: 2000,
          type: AppNotificationType.timed,
        }).show();
      }
      f.activeTab = 0;
      args.setFileData([f]);

      setTimeout(() => {
        (
          document.querySelector(
            `.${require("../../subcomponents/input/input.module.css").input}`
          ) as HTMLInputElement
        )?.focus();
        (
          document.querySelector(
            `.${require("../../subcomponents/input/input.module.css").input}`
          ) as HTMLInputElement
        )?.select();
      }, 10);

      return;
    case MenuTask.load_metadata:
      let _selected = files.filter((i) => i.id === args.selected)[0];
      if (_selected.metadataState !== MetadataLoadState.false)
        return new AppNotification({
          title: "Metadata task",
          text:
            _selected.metadataState === MetadataLoadState.true
              ? "Metadata Already loaded."
              : "Metadata Loading.",
          type: AppNotificationType.timed,
          timeout: 2500,
        }).show();
      args.loadInfo(_selected);
      _selected.metadataState = MetadataLoadState.loading;
      args.setFileData([_selected]);
      return;
    case MenuTask.load_metadata_all:
      let msg = new AppNotification({
        title: "Metadata task",
        text: "Loading Metadata.",
        type: AppNotificationType.progress,
      });
      msg.show();
      let mt_l = [];
      for (let i = 0; i < files.length; i++) {
        if (files[i].metadataState === MetadataLoadState.false) {
          files[i].metadataState = MetadataLoadState.loading;
          args.setFileData([files[i]]);
          mt_l.push(files[i]);
        }
      }
      for (let i = 0; i < mt_l.length; i++) {
        await args.loadInfo(mt_l[i]);
      }
      msg.delete();
      return;
    case MenuTask.close_app:
      files.forEach((i) => {
        URL.revokeObjectURL(i.data_url ?? "");
        URL.revokeObjectURL(i.thumbnail ?? "");
      });

      return args.setFiles([]);
    case MenuTask.save_thumbnail:
      let selected_ = files.filter((i) => i.id === args.selected)[0];
      if (selected_?.thumbnail) {
        download(
          selected_?.thumbnail,
          `thumbnail - ${selected_.file.name} - ${process.env.REACT_APP_name}.jpg`
        );
      } else {
        new AppNotification({
          text: "Thumbnail not loaded.",
          title: "Thumbnail Download",
          type: AppNotificationType.timed,
          timeout: 1500,
        });
      }
      return;
    case MenuTask.save_file:
      var selected = files.filter((i) => i.id === args.selected)[0];
      if (selected) {
        new AppNotification({
          text: "Downloading File.",
          title: "Download",
          type: AppNotificationType.timed,
          timeout: 1500,
        });
        download(URL.createObjectURL(selected.file), selected.file.name, true);
      }
      return;
    case MenuTask.save_metadata:
      var selected = files.filter((i) => i.id === args.selected)[0];
      if (selected.metadata) {
        let data = new Blob([JSON.stringify(selected.metadata, null, 4)], {
          type: "application/json",
        });
        download(
          URL.createObjectURL(data),
          `metadata - ${selected.file.name}.json`
        );
      } else {
        new AppNotification({
          text: "Load Metadata First.",
          title: "Metadata",
          type: AppNotificationType.timed,
          timeout: 1500,
        }).show();
      }
      return;
    case MenuTask.app_install:
      if ("ServiceWorker" in window) {
        new AppNotification({
          id: NotificationIDs.AppInstall,
          type: AppNotificationType.action,
          title: "App Install",
          text: "Do you want to install App",
          actions: [
            {
              name: "Info",
              task: () => {
                showInstaller();
              },
            },
            {
              name: "Install",
              task: () => {
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
              },
            },
          ],
        }).show();
        return;
      }
      new AppNotification({
        id: NotificationIDs.AppInstall,
        type: AppNotificationType.timed,
        title: "App Install",
        text: "Your browser does not support this feature.",
        timeout: 2000,
      }).show();
  }
}
async function AddFile(
  type: MenuTask,
  setFiles: Function,
  files: FileHandler[]
) {
  const dialog = document.createElement("input");
  dialog.type = "file";
  dialog.multiple = type === MenuTask.open_files ? true : false;
  if (type === MenuTask.open_folder) {
    dialog.webkitdirectory = true;
  }
  dialog.click();
  await (async () => {
    return new Promise((res) => {
      dialog.onchange = () => res(true);
    });
  })();
  if (!dialog.files) return;
  await FileTask(Array.from(dialog.files), files, setFiles);
}

async function FileTask(
  new_files: File[],
  files: FileHandler[],
  setFiles: Function,
  downloaded?: boolean
) {
  let f_list: FileHandler[] = [];
  let msg = new AppNotification({
    text: `Adding ${new_files.length} files`,
    type: AppNotificationType.progress,
    title: "Adding Files",
  });
  msg.show();

  for (let i = 0; i < new_files.length; i++) {
    msg.text = `checking ${new_files[i].name}`;
    msg.show();
    if (!new_files[i].type.includes("video")) continue;
    let logs = await RunFFpeg(
      new_files[i],
      "-v",
      "error",
      "-sseof",
      "-5",
      "-i",
      new_files[i].name
    );
    if (logs[2].msg === "At least one output file must be specified") {
      let _file = createFileHandler({
        file: new_files[i],
        in_progress: true,
        type: downloaded ? FileType.downloaded : FileType.inDevice,
      });
      f_list.push(_file);
      files.push(_file);
      setFiles(files);
    }
  }

  msg.timeout = 2500;
  msg.type = AppNotificationType.timed;
  if (f_list.length === 0) {
    msg.text = `No video files found`;
    msg.show(true);
    return;
  }
  msg.text = `${f_list.length} files added`;
  msg.show(true);
  files = await getThumbnails(files);
  setFiles(files);
  files = await getVideoLength(files);
  setFiles(files);
  return;
}
