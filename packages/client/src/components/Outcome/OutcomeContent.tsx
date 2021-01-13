// @TODO: TRANSLATE
import { Heading, themeSpacing } from "@amsterdam/asc-ui";
import { ClientOutcomes } from "@vergunningcheck/imtr-client";
import React, { FunctionComponent, ReactNode, useEffect } from "react";
import { isIE, isMobile } from "react-device-detect";
import styled, { css } from "styled-components";

import { ComponentWrapper, HideForPrint, PrintButton } from "../../atoms";
import { actions, eventNames } from "../../config/matomo";
import { useTracking } from "../../hooks";
import { PRINT_BUTTON } from "../../utils/test-ids";
import NewCheckerModal from "./NewCheckerModal";

const OutcomeContentWrapper = styled.div<{ showDiscaimer?: boolean }>`
  margin-bottom: ${themeSpacing(9)};

  ${({ showDiscaimer }) =>
    showDiscaimer &&
    css`
      margin-bottom: ${themeSpacing(10)};
    `};
`;

type OutcomeContent = {
  description?: string;
  eventName?: string;
  footerContent?: ReactNode;
  mainContent?: ReactNode;
  title: string;
};

type OutcomeContentProps = {
  outcomeContent: OutcomeContent;
  outcomeType: ClientOutcomes;
  showDiscaimer?: boolean;
};

const OutcomeContent: FunctionComponent<OutcomeContentProps> = ({
  outcomeContent,
  outcomeType,
  showDiscaimer,
}) => {
  const { matomoTrackEvent } = useTracking();
  const { footerContent, mainContent, title } = outcomeContent;

  useEffect(() => {
    // @TODO: this event should be handled by the user event and should not be triggered on reload
    // See: https://trello.com/c/5FstLxRd/210-technical-dept-checker-slopen
    matomoTrackEvent({
      action: actions.THIS_IS_THE_OUTCOME,
      name: title,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrintButton = () => {
    matomoTrackEvent({
      action: actions.DOWNLOAD,
      name: eventNames.SAVE_OUTCOME,
    });
    window.print();
  };

  return (
    <OutcomeContentWrapper {...{ showDiscaimer }}>
      <ComponentWrapper marginBottom={16} />
      <ComponentWrapper marginBottom={24}>
        <Heading forwardedAs="h2">{title}</Heading>
      </ComponentWrapper>

      {mainContent}

      <HideForPrint>
        {!isIE && !isMobile && (
          <PrintButton
            data-testid={PRINT_BUTTON}
            marginBottom={outcomeType === ClientOutcomes.PERMIT_FREE ? 32 : 40}
            onClick={handlePrintButton}
            variant="textButton"
          >
            Uitkomst opslaan
          </PrintButton>
        )}
      </HideForPrint>

      <ComponentWrapper marginBottom={footerContent ? 52 : 0}>
        {footerContent}
      </ComponentWrapper>

      <HideForPrint>
        <NewCheckerModal />
        {!isMobile && <ComponentWrapper>&nbsp;</ComponentWrapper>}
      </HideForPrint>
    </OutcomeContentWrapper>
  );
};

export default OutcomeContent;
