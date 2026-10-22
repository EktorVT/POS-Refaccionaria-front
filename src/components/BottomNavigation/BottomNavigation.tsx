import { type ComponentProps } from "react";
import styles from "./BottomNavigation.module.css";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/Auth/useAuth";
import { navigationItems } from "../../config/navigation";

export default function BottomNavigation({
  className = "",
  ...props
}: ComponentProps<"nav">) {
  const { user } = useAuth();

  const visibleItems = navigationItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <nav
      aria-label="Navegación inferior"
      className={`${styles.nav} ${className}`}
      {...props}
    >
      <ul className={styles.ul}>
        {visibleItems.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `${styles.item} ${isActive ? styles.active : ""}`
                }
              >
                <Icon />
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
