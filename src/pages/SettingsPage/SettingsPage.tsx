import Button from "../../components/Button/Button";
import { useAuth } from "../../context/Auth/useAuth";

export default function SettingsPage() {
  const { logout } = useAuth();

  return (
    <div>
      SettingsPage
      <Button onClick={logout}>Cerrar sesión</Button>
    </div>
  );
}
