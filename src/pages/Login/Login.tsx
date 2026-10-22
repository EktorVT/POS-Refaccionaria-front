import Button from "../../components/Button/Button";
import styles from "./Login.module.css";
import Input from "../../components/Input/Input";
import { useState } from "react";
import { Eye, EyeOff, Lock, MoveRight, User } from "lucide-react";
import { useAuth } from "../../context/Auth/useAuth";
import { useToast } from "../../context/Toast/useToast";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login } = useAuth();
  const { showToast } = useToast();

  const verifyData = async () => {
    if (username === "" || password === "") {
      setErrorMessage("El usuario y la contraseña son obligatorios");
      return;
    }

    setErrorMessage("");
    try {
      await login(username, password);
    } catch (error) {
      showToast({
        type: "error",
        title: "No se pudo iniciar sesión",
        message: "Ocurrió un error al iniciar sesión"
      });
      console.log(error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Reaccionaria</h1>
        <h2 className={styles.subtitle}>Inicia sesión para continuar</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            verifyData();
          }}
        >
          <label className={styles.label} htmlFor="username">
            Usuario
          </label>
          <Input
            id="username"
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Usuario"
            value={username}
            icon={<User />}
          />

          <label className={styles.label} htmlFor="password">
            Contraseña
          </label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            value={password}
            icon={<Lock />}
            rightElement={
              <button
                type="button"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                title={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                onClick={() => setShowPassword((previous) => !previous)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            }
          ></Input>
          {errorMessage && <p className={styles.error}>{errorMessage}</p>}

          <div className={styles.buttonContainer}>
            <Button className={styles.button} type="submit">
              Iniciar sesión <MoveRight className={styles.buttonIcon} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
