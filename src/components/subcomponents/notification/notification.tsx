import React, { Component } from "react";
import { cssClass } from "../../../utils/css";
import { getHash, removeFromArray } from "../../../utils/utils";
import style from "./notification.module.css";
const eventTarget = new EventTarget();
export enum AppNotificationType {
  timed,
  progress,
  action,
}

export default class NotificationRender extends Component<
  any,
  {
    massages: {
      title?: string;
      text: string;
      id: number;
      type: AppNotificationType;
      actions?: { name: string | JSX.Element; task: Function }[];
    }[];
  }
> {
  state = {
    /* fake message */
    massages: [
      {
        text: "",
        id: 0,
        title: "",
        type: AppNotificationType.timed,
        actions: [{ name: "", task: () => {} }],
      },
    ],
  };
  constructor(props: any) {
    super(props);
    this.handleNF = this.handleNF.bind(this);
  }

  componentDidMount() {
    eventTarget.addEventListener("notify", this.handleNF);
  }
  componentWillUnmount() {}
  handleNF(e: any) {
    let index = this.state.massages.findIndex((i) => i.id === e.detail.id);
    if (e.detail.cmd === "delete")
      return this.setState({
        massages: this.state.massages.filter((d) => d.id !== e.detail.id),
      });
    if (index === -1) {
      //Add
      return this.setState({ massages: [...this.state.massages, e.detail] });
    }
    let msg = this.state.massages;
    msg[index] = e.detail;
    this.setState({ massages: msg });
  }
  render() {
    return (
      <div className={style.holder}>
        {this.state.massages.map((i, n) => {
          if (n === 0) return <React.Fragment key={i.id}></React.Fragment>;
          return (
            <div className={style.nf} key={i.id}>
              <div className={style.head}>
                <div className={style.title}> {i.title}</div>
                {i.type !== AppNotificationType.progress ? (
                  <div
                    className={style.close_btn}
                    onClick={() => {
                      this.setState({
                        massages: this.state.massages.filter(
                          (d) => d.id !== i.id
                        ),
                      });
                    }}
                  >
                    <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                      />
                    </svg>
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <div className={style.text}>{i.text}</div>
              <div className={cssClass(i.actions?.length ? style.btn_s : "")}>
                {i.actions?.map((a) => (
                  <div
                    key={a.name}
                    className={style.btn}
                    onClick={() => {
                      this.setState({
                        massages: removeFromArray(this.state.massages, n),
                      });
                      a.task();
                    }}
                  >
                    {a.name}
                  </div>
                ))}
              </div>
              {i.type === AppNotificationType.progress ? (
                <div className={style.p_bar}>
                  <div className={style.p_bar_in}></div>
                </div>
              ) : (
                <></>
              )}
            </div>
          );
        })}
      </div>
    );
  }
}

export class AppNotification {
  text: string | JSX.Element;
  timeout: number;
  type: AppNotificationType;
  title: string | undefined;
  actions: { name: string; task: Function }[] | undefined;
  private _deleted: boolean;
  private _id: number;
  private _showed: boolean = false;

  private _counter?: number;

  constructor(data: {
    id?: number;
    text: string;
    type: AppNotificationType;
    title?: string;
    timeout?: number;
    actions?: { name: string; task: Function }[];
  }) {
    this.text = data.text;
    this.timeout = data.timeout ?? 400;
    this.type = data.type;
    this.title = data.title;
    this._deleted = false;
    this._id = data.id ?? getHash(data.text);
    this.actions = data.actions;
  }
  private _count_down() {
    clearTimeout(this._counter);
    if (this.type === AppNotificationType.timed) {
      this._counter = window.setTimeout(() => {
        this.delete();
      }, this.timeout);
    }
  }
  private _sendEvent(d: any) {
    eventTarget.dispatchEvent(
      new CustomEvent("notify", {
        detail: d,
      })
    );
  }
  //todo add native notification
  show(main?: boolean) {
    this._sendEvent({
      cmd: this._showed ? (this._deleted ? "show" : "update") : "show",
      text: this.text,
      id: this._id,
      type: this.type,
      title: this.title,
      actions: this.actions,
    });
    this._deleted = false;
    this._showed = true;
    this._count_down();
  }

  delete() {
    this._sendEvent({
      cmd: "delete",
      id: this._id,
    });
    this._deleted = true;
  }
  get id() {
    return this._id;
  }
  get deleted() {
    return this._deleted;
  }
}
