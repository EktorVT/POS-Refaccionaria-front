import { Outlet } from "react-router-dom";
import styles from "./AppLayout.module.css";
import Header from "../../components/Header/Header";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import Sidebar from "../../components/Sidebar/Sidebar";

export default function AppLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar className={styles.sidebar} />
      <div className={styles.content}>
        <Header />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
      <BottomNavigation className={styles.bottomNavigation} />
    </div>
  );
}
