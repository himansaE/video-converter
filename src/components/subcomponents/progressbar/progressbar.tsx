import React from "react";
import { cssClass } from "../../../utils/css";
import style from "./progressbar.module.css";
export default function ProgressBar(props: { progress?: number }) {
  return (
    <div className={style.bar_con}>
      <div className={style.bar}>
        <div
          className={cssClass(
            style.inside,
            props.progress === undefined ? style.infinity : ""
          )}
          style={{ width: `${props.progress}%` }}
        ></div>
      </div>
    </div>
  );
}
