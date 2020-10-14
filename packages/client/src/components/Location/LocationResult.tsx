import { Heading, Paragraph } from "@amsterdam/asc-ui";
import React, { useContext } from "react";

import { generateOloUrl } from "../../config";
import { actions, eventNames, sections } from "../../config/matomo";
import { SessionContext, SessionDataType } from "../../context";
import { LOCATION_RESULT } from "../../utils/test-ids";
import Form from "../Form";
import Nav from "../Nav";
import RegisterLookupSummary from "../RegisterLookupSummary";

type LocationResultProps = {
  matomoTrackEvent: Function;
  setActiveState: Function;
  topic: any; // @TODO: replace with custom hooks
};

const LocationResult: React.FC<LocationResultProps> = ({
  matomoTrackEvent,
  setActiveState,
  topic,
}) => {
  // @TODO: replace with custom topic hooks
  const sessionContext = useContext<SessionDataType & { setSessionData?: any }>(
    SessionContext
  );
  const address = sessionContext[topic.slug].address;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    matomoTrackEvent({
      action: actions.CLICK_EXTERNAL_NAVIGATION,
      name: eventNames.TO_OLO,
    });
    window.open(generateOloUrl(address), "_blank");
  };

  const onGoToPrev = () => {
    matomoTrackEvent({
      action: actions.CLICK_INTERNAL_NAVIGATION,
      name: `${eventNames.BACK} ${sections.LOCATION_INPUT}`,
    });
    setActiveState(sections.LOCATION_INPUT);
  };

  return (
    <Form data-testid={LOCATION_RESULT} onSubmit={onSubmit}>
      <Heading forwardedAs="h3">Adresgegevens</Heading>
      <RegisterLookupSummary
        showTitle
        {...{
          setActiveState,
          topic,
        }}
      />
      <Paragraph gutterBottom={0}>
        U hebt deze informatie nodig om de vergunningcheck te doen op het
        Omgevingsloket.
      </Paragraph>
      <Nav
        formEnds
        nextText={"Naar het omgevingsloket"}
        noMarginBottom
        onGoToPrev={onGoToPrev}
        showNext
        showPrev
      />
    </Form>
  );
};

export default LocationResult;