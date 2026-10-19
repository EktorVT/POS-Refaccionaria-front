import Button from "../../components/Button/Button";
import styles from "./Login.module.css";
import Input from "../../components/Input/Input";
import { useState } from "react";
import { Eye, EyeOff, Lock, MoveRight, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import LangMenu from "../../components/LangMenu/LangMenu";
import { useAuth } from "../../context/Auth/useAuth";
import { useToast } from "../../context/Toast/useToast";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { t } = useTranslation("login");
  const { login } = useAuth();
  const { showToast } = useToast();

  const verifyData = async () => {
    if (username === "" || password === "") {
      setErrorMessage(t("errors.required"));
      return;
    }

    setErrorMessage("");
    try {
      await login(username, password);
    } catch (error) {
      showToast({
        type: "error",
        title: t("errors.errorLogin"),
        message: t("errors.errorLoginMessage")
      });
      console.log(error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <LangMenu />
        <h1 className={styles.title}>{t("title")}</h1>
        <h2 className={styles.subtitle}>{t("subtitle")}</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            verifyData();
          }}
        >
          <label className={styles.label} htmlFor="username">
            {t("fields.username.label")}
          </label>
          <Input
            id="username"
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t("fields.username.placeholder")}
            value={username}
            icon={<User />}
          />

          <label className={styles.label} htmlFor="password">
            {t("fields.password.label")}
          </label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("fields.password.placeholder")}
            value={password}
            icon={<Lock />}
            rightElement={
              <button
                type="button"
                aria-label={
                  showPassword
                    ? t("actions.hidePassword")
                    : t("actions.showPassword")
                }
                title={
                  showPassword
                    ? t("actions.hidePassword")
                    : t("actions.showPassword")
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
              {t("actions.login")} <MoveRight className={styles.buttonIcon} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
