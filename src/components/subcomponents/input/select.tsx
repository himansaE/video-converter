import { useState } from "react";
import { cssClass } from "../../../utils/css";
import style from "./input.module.css";
export function Select(props: {
  values: string[];
  default: number;
  default_name?: string;
}) {
  const [index, setIndex] = useState(props.default ?? 0);
  const [focused, setFocus] = useState(false);
  const _f = () => {
    setFocus(false);
    document.removeEventListener("click", _f);
  };

  return (
    <div className={style.select}>
      <div
        className={style.con}
        onClick={(e) => {
          setFocus(!focused);
          setTimeout(() => {
            document.addEventListener("click", _f);
          }, 1);
        }}
      >
        <input
          tabIndex={-1}
          type="text"
          className={style.input}
          value={props.values[index] ?? props.default_name ?? "Select"}
          readOnly={true}
        />
        <div className={style.select_arrow}>
          <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24">
            <path
              fill="#b5b5b5"
              d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
            />
          </svg>
        </div>
      </div>
      {focused ? (
        <div className={style.s_con}>
          {props.values.map((i, n) => (
            <div
              className={cssClass(
                style.s_option,
                index === n ? style.s_option_f : ""
              )}
              key={i}
              onClick={() => {
                setIndex(n);
              }}
            >
              {index === n ? (
                <div
                  className={style.s_focused}
                  ref={(e) => {
                    e?.scrollIntoView({ block: "nearest", inline: "nearest" });
                  }}
                ></div>
              ) : (
                <></>
              )}
              {i}
            </div>
          ))}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
