"use client";

import { useState } from "react";
import styles from "./CreatedAndSavedPins.module.css";
import { useTranslation } from "react-i18next";
import CreatedPins from "./CreatedPins";
import SavedPins from "./SavedPins";
import { AccountWithPublicDetails } from "@/lib/types/frontendTypes";

enum TAB {
  CREATED = "CREATED",
  SAVED = "SAVED",
}

type CreatedAndSavedPinsProps = {
  account: AccountWithPublicDetails;
};

const CreatedAndSavedPins = ({ account }: CreatedAndSavedPinsProps) => {
  const { t } = useTranslation("AccountDetails");

  const [activeTab, setActiveTab] = useState<TAB>(TAB.CREATED);

  const getTabHandler =
    ({ tab }: { tab: TAB }) =>
    () => {
      setActiveTab(tab);
    };

  const createdTabButtonClasses = [
    styles.tabButton,
    activeTab === TAB.CREATED ? null : styles.tabButtonInactive,
  ];

  const savedTabButtonClasses = [
    styles.tabButton,
    activeTab === TAB.SAVED ? null : styles.tabButtonInactive,
    styles.tabButtonSaved,
  ];

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <div>
          <button
            onClick={getTabHandler({ tab: TAB.CREATED })}
            className={createdTabButtonClasses.join(" ")}
          >
            {t("TAB_CREATED")}
          </button>
          <div
            className={
              activeTab === TAB.CREATED
                ? styles.tabUnderlineActive
                : styles.tabUnderlineInactive
            }
          />
        </div>
        <div className={styles.savedTabButtonContainer}>
          <button
            onClick={getTabHandler({ tab: TAB.SAVED })}
            className={savedTabButtonClasses.join(" ")}
          >
            {t("TAB_SAVED")}
          </button>
          <div
            className={
              activeTab === TAB.SAVED
                ? styles.tabUnderlineActive
                : styles.tabUnderlineInactive
            }
          />
        </div>
      </div>
      {activeTab === TAB.CREATED && <CreatedPins />}
      {activeTab === TAB.SAVED && <SavedPins account={account} />}
    </div>
  );
};

export default CreatedAndSavedPins;
