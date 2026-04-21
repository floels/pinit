import { FormEvent, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./HeaderSearchBar.module.css";
import classNames from "classnames";

type HeaderSearchBarProps = {
  inputValue: string;
  isInputFocused: boolean;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onInputFocus: () => void;
  onInputBlur: () => void;
  onClickClearIcon: () => void;
  onPressEscape: () => void;
  searchSuggestions: string[];
  getSuggestionLinkClickHandler: (suggestion: string) => () => void;
};

const HeaderSearchBar = ({
  inputValue,
  isInputFocused,
  onInputChange,
  onInputFocus,
  onInputBlur,
  onClickClearIcon,
  onPressEscape,
  searchSuggestions,
  getSuggestionLinkClickHandler,
}: HeaderSearchBarProps) => {
  const navigate = useNavigate();

  const { t } = useTranslation("HeaderAuthenticated");

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    navigate(`/search/pins?q=${inputValue}`);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onPressEscape();
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className={classNames(styles.container, {
        [styles.containerInputFocused]: isInputFocused,
      })}
      data-testid="header-search-bar"
    >
      {!isInputFocused && (
        <FontAwesomeIcon
          icon={faSearch}
          className={styles.inputSearchIcon}
          data-testid="search-icon"
        />
      )}
      <input
        type="text"
        ref={inputRef}
        value={inputValue}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        className={styles.searchInput}
        placeholder={t("PLACEHOLDER_SEARCH")}
        onChange={onInputChange}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        data-testid="search-bar-input"
      />
      <button
        className={classNames(styles.clearIconContainer, {
          [styles.clearIconContainerHidden]: !isInputFocused,
        })}
        onClick={onClickClearIcon}
        data-testid="clear-icon"
      >
        <FontAwesomeIcon icon={faCircleXmark} size="lg" />
      </button>
      {searchSuggestions.length > 0 && (
        <ul
          className={classNames(styles.searchSuggestionsList, {
            [styles.searchSuggestionsListHidden]: !isInputFocused,
          })}
          data-testid="search-suggestions-list"
        >
          {searchSuggestions.map((suggestion, index) => (
            <li
              className={styles.searchSuggestionsListItem}
              key={`search-suggestion-${index}`}
              data-testid="search-suggestions-list-item"
              onClick={getSuggestionLinkClickHandler(suggestion)}
            >
              <FontAwesomeIcon
                icon={faSearch}
                className={styles.searchSuggestionSearchIcon}
              />
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
};

export default HeaderSearchBar;
