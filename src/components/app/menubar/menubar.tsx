import { Component } from "react";
import { cssClass } from "../../../utils/css";
import { MenuTask } from "./eventActions";
import style from "./menubar.module.css";

export class MenuBar extends Component<
  { eventTarget: EventTarget; inTask: boolean },
  { selected?: string }
> {
  list: {
    name: string;
    values: {
      name: string;
      action?: MenuTask;
      block?: boolean;
      support?: boolean;
    }[];
  }[] = [
    {
      name: "File",
      values: [
        { name: "Open File", action: MenuTask.open_file },
        { name: "Open Files", action: MenuTask.open_files },
        {
          name: "Open Folder",
          action: MenuTask.open_folder,
          support: "webkitdirectory" in document.createElement("input"),
        },
        { name: "Open File by url", action: MenuTask.open_url },
        { name: "hr" },

        {
          name: "Remove Selected",
          action: MenuTask.remove_selected,
          block: false,
        },
        { name: "Close App", action: MenuTask.close_app },
      ],
    },
    {
      name: "Edit",
      values: [
        { name: "Rename Video", action: MenuTask.rename_file, block: false },
      ],
    },
    {
      name: "Media",
      values: [
        { name: "Load Metadata for Selected", action: MenuTask.load_metadata },
        { name: "Load Metadata All", action: MenuTask.load_metadata_all },
        { name: "Save Thumbnail", action: MenuTask.save_thumbnail },
        { name: "Save File", action: MenuTask.save_file },
        { name: "Save Metadata", action: MenuTask.save_metadata },
      ],
    },
    {
      name: "More",
      values: [
        { name: "Install App", action: MenuTask.app_install, block: false },
        { name: "About", action: MenuTask.about, block: false },
      ],
    },
  ];
  state = {
    selected: undefined,
  };
  render() {
    return (
      <div className={style.bar} onContextMenu={(e) => e.preventDefault()}>
        <ul className={style.bar_list}>
          {this.list.map((i) => (
            <li key={i.name} className={style.bar_item}>
              <div
                className={cssClass(
                  style.bar_text,
                  this.state.selected === i.name ? style.bar_item_s : ""
                )}
                onClick={(e) => {
                  const c_target = e.currentTarget;
                  const _f = (e: MouseEvent) => {
                    if (!(e.target as Node).contains(c_target)) {
                      this.setState({ selected: undefined });
                      document.removeEventListener("click", _f);
                    }
                  };
                  if (this.state.selected) {
                    this.setState({ selected: undefined });
                    document.removeEventListener("click", _f);
                  } else {
                    this.setState({ selected: i.name });
                    document.addEventListener("click", _f);
                  }
                }}
                onMouseEnter={() => {
                  if (this.state.selected !== undefined)
                    this.setState({ selected: i.name });
                }}
              >
                {i.name}
              </div>
              {this.state.selected === i.name ? (
                <div className={style.menu}>
                  {i.values.map((val) => {
                    if (val.name === "hr")
                      return (
                        <div key={new Date().getTime()} className={style.hr} />
                      );
                    return (val.support ?? true) === true ? (
                      !(this.props.inTask && (val.block ?? true)) ? (
                        <div
                          className={style.menu_i}
                          key={val.name}
                          onClick={() => {
                            this.props.eventTarget.dispatchEvent(
                              new CustomEvent("menubar", {
                                detail: {
                                  task: val.action,
                                },
                              })
                            );
                          }}
                        >
                          {val.name}
                        </div>
                      ) : (
                        <div
                          className={cssClass(style.menu_i, style.menu_i_des)}
                          key={val.name}
                        >
                          {val.name}
                        </div>
                      )
                    ) : (
                      <div
                        className={cssClass(style.menu_i, style.menu_i_des)}
                        key={val.name}
                      >
                        {val.name}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <></>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
