import LangMenu from "../LangMenu/LangMenu";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.container}>
      <h3>Reaccionaria </h3>
      <LangMenu />
    </header>
  );
}
