import { setPortal } from "../../../default";
import style from "./portal.module.css";

export function Portal(props: React.PropsWithChildren<{ closeable: Boolean }>) {
  return (
    <div
      className={style.con}
      onClick={(e) => {
        if (!props.closeable) return;

        if (e.currentTarget === e.target) setPortal(<></>);
      }}
    >
      {props.children}
    </div>
  );
}
