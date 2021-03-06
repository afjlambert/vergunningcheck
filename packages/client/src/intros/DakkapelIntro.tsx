import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

import { Intro } from "./shared";

const DakraamIntro: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <Intro
      usableForBullets={[
        t("introPage.common.monument bullet"),
        t("introPage.dakkapel.placing bullet"),
      ]}
      usableForText={t("introPage.dakkapel.intro description")}
      exceptions={[
        t("introPage.dakkapel.exception"),
        t("introPage.common.amount of houses exception"),
        t("introPage.dakkapel.build without permit exception"),
      ]}
    />
  );
};

export default DakraamIntro;
