import { Heading, ListItem } from "@amsterdam/asc-ui";
import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { List } from "../../../atoms/index";
import { urls } from "../../../config";
import { eventNames } from "../../../config/matomo";
import { NEED_REPORT } from "../../../utils/test-ids";
import Link from "../../Link";

// @TODO: Verify texts (robin)

const DemolitionNeedReport: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Heading forwardedAs="h3" data-testid={NEED_REPORT}>
        {t("outcome.payAttentionTo.pay attention heading")}
      </Heading>
      <List variant="bullet">
        <ListItem>
          <Trans
            i18nKey={"outcome.payAttentionTo.permit free demolition exception"}
          >
            Misschien staat in het bestemmingsplan dat een vergunning toch nodig
            is. Lees hiervoor verder op de pagina
            <Link
              eventName={eventNames.VIEW_ZONING_PLAN}
              href={urls.VIEW_ZONING_PLAN}
              target="_blank"
              variant="inline"
            >
              Bestemmingsplan bekijken
            </Link>
            .
          </Trans>
        </ListItem>
        <ListItem>{t("outcome.payAttentionTo.take in account")}</ListItem>
      </List>
      <Heading forwardedAs={"h3"}>
        {t("outcome.thinkAbout.also think about")}
      </Heading>
      <List variant={"bullet"}>
        <ListItem>{t("outcome.thinkAbout.placement of a crane")}</ListItem>
        <ListItem>{t("outcome.thinkAbout.disposal of waste")}</ListItem>
        <ListItem>{t("outcome.thinkAbout.permission from the VvE")}</ListItem>
        <ListItem>{t("outcome.thinkAbout.consent from neighbors")}</ListItem>
      </List>
    </>
  );
};

export default DemolitionNeedReport;
