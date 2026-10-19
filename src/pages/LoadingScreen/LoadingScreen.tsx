import Spinner from "../../components/Spinner/Spinner";
import styles from "./LoadingScreen.module.css";
import { useTranslation } from "react-i18next";
export default function LoadingScreen() {
  const { t } = useTranslation();
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <Spinner />
        <p>{t("common.loading")}...</p>
      </div>
    </main>
  );
}
