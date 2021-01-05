import React, { FunctionComponent } from "react";

import { autofillResolvers } from "../../config/autofill";
import { useChecker, useTopicData } from "../../hooks";
import { SectionProps } from "../../pages/CheckerPage3";
import { Address } from "../../types";
import LocationSummary from "./LocationSummary";
import { LocationInput } from ".";

const LocationSection: FunctionComponent<SectionProps> = (props) => {
  const { checker } = useChecker();
  const { setTopicData } = useTopicData();

  const {
    currentSection: { isActive },
    sectionFunctions: { goToNextSection },
  } = props;

  if (!checker) {
    return null;
  }

  // On LocationSubmit
  const handleNewAddressSubmit = (address: Address) => {
    setTopicData({
      // XXX: Somehow save the state on reload
      // activeComponents: [sections.QUESTIONS],
      // finishedComponents: [sections.LOCATION_INPUT],
      address,
    });

    // Autofill `checker` when `address` is submitted
    checker.autofill(autofillResolvers, { address });

    goToNextSection();
  };

  return (
    <>
      {isActive && (
        <LocationInput
          {...{
            handleNewAddressSubmit,
          }}
        />
      )}
      {!isActive && <LocationSummary showEditLocationModal />}
    </>
  );
};

export default LocationSection;
