import type { ComponentProps, ReactNode } from "react";
import styles from "./Input.module.css";

interface InputProps extends ComponentProps<"input"> {
  icon?: ReactNode;
  rightElement?: ReactNode;
}

export default function Input({
  icon,
  rightElement,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className={styles.inputWrapper}>
      <div className={styles.inputField}>
        {icon && <div className={styles.icon}>{icon}</div>}

        <input className={`${styles.input} ${className}`} {...props}></input>
      </div>
      {rightElement && (
        <div className={styles.extraContent}>{rightElement}</div>
      )}
    </div>
  );
}
