import { useState } from "react";
import { cssClass } from "../../../utils/css";
import style from "./input.module.css";

export function Input(props: {
  value?: string;
  disabled?: boolean;
  setValue?: Function;
  placeHolder?: string;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState(props.value);
  return (
    <div
      className={cssClass(style.con, props.disabled ? style.disabled : "")}
      title={props.disabled ? value : ""}
    >
      <input
        className={cssClass(
          style.input,
          props.disabled ? style.disabled_t : ""
        )}
        value={value}
        placeholder={props.placeHolder}
        autoFocus={props.autoFocus}
        onChange={(e) => {
          if (props.disabled) return;
          setValue(e.target.value);
          props.setValue && props.setValue(e.target.value);
        }}
      />
    </div>
  );
}
