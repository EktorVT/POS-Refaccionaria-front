import styles from "./Spinner.module.css";

interface SpinnerProps {
  size?: "small" | "medium" | "large";
}

export default function Spinner({ size = "medium" }: SpinnerProps) {
  return (
    <span
      className={`${styles.spinner} ${styles[size]}`}
      role="status"
      aria-label="Loading"
    ></span>
  );
}
