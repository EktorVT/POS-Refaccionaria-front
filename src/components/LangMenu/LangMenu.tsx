import { useState } from "react";
import i18n from "../../i18n";
import { ChevronDown, Globe } from "lucide-react";
import styles from "./LangMenu.module.css";

type LanguageCode = "en" | "es";

const languages: { code: LanguageCode; label: string; shortLabel: string }[] = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "es", label: "Español", shortLabel: "ES" }
];

export default function LangMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng: LanguageCode) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };
  return (
    <div className={styles.dropdown}>
      <button
        onClick={() => setIsOpen((previous) => !previous)}
        className={styles.dropdownButton}
      >
        <Globe className={styles.icon} />
        <p className={styles.langTitle}>
          {languages.find((lang) => lang.code === i18n.language)?.shortLabel}
        </p>
        <ChevronDown className={styles.arrow} />
      </button>

      {isOpen && (
        <ul className={styles.menu}>
          {languages.map((lang) => (
            <li key={lang.code}>
              <button onClick={() => changeLanguage(lang.code)}>
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
