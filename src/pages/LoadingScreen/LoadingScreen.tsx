import Spinner from "../../components/Spinner/Spinner";
import styles from "./LoadingScreen.module.css";

export default function LoadingScreen() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <Spinner />
        <p>Cargando...</p>
      </div>
    </main>
  );
}
