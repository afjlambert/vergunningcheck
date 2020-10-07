import { Paragraph } from "@amsterdam/asc-ui";
import { setTag } from "@sentry/browser";
import React, { useContext } from "react";

import { ComponentWrapper, List, ListItem } from "../atoms";
import { SessionContext, SessionDataType } from "../context";
import { getRestrictionByTypeName } from "../utils";
import { uniqueFilter } from "../utils";
import {
  LOCATION_RESTRICTION_CITYSCAPE,
  LOCATION_RESTRICTION_MONUMENT,
  LOCATION_ZONING_PLANS,
} from "../utils/test-ids";
import AddressLines from "./AddressLines";
import ChangeAddressModal from "./Location/ChangeAddressModal";

// @TODO: can you make a props file for these kinds of props, @andre?
type zoningPlanProps = {
  name: string;
};

type RegisterLookupSummaryProps = {
  addressFromLocation: any;
  compact: boolean;
  setActiveState: Function;
  topic: any; // @TODO: replace with custom hooks
};

const RegisterLookupSummary: React.FC<RegisterLookupSummaryProps> = ({
  addressFromLocation,
  compact,
  setActiveState,
  topic: { slug, hasIMTR },
}) => {
  // @TODO: replace with custom topic hooks
  const sessionContext = useContext<SessionDataType>(SessionContext);
  const address = addressFromLocation
    ? addressFromLocation
    : sessionContext[slug].address; // @TODO: replace with custom hooks
  const { restrictions, zoningPlans } = address;
  const monument = getRestrictionByTypeName(restrictions, "Monument")?.name;
  const cityScape = getRestrictionByTypeName(restrictions, "CityScape")?.name;
  const zoningPlanNames = zoningPlans
    .map((plan: zoningPlanProps) => plan.name)
    .filter(uniqueFilter); // filter out duplicates (ie "Winkeldiversiteit Centrum" for 1012TK 1a)

  if (monument) {
    setTag("monument", monument);
  }
  if (cityScape) {
    setTag("cityscape", cityScape);
  }

  return (
    <ComponentWrapper marginBottom={hasIMTR && 0}>
      <AddressLines
        {...address}
        editAddressRenderer={() =>
          !compact && (
            <ChangeAddressModal {...{ hasIMTR, setActiveState, slug }} />
          )
        }
        gutterBottom={monument || cityScape ? 16 : 0}
      />
      {compact && (monument || cityScape) && (
        <Paragraph gutterBottom={0} strong>
          Over dit adres hebben we de volgende gegevens gevonden:
        </Paragraph>
      )}
      {(monument || !hasIMTR) && (
        <Paragraph data-testid={LOCATION_RESTRICTION_MONUMENT} gutterBottom={0}>
          {monument
            ? `Het gebouw is een ${monument.toLowerCase()}.`
            : "Het gebouw is geen monument."}
        </Paragraph>
      )}
      {(cityScape || !hasIMTR) && (
        <Paragraph
          data-testid={LOCATION_RESTRICTION_CITYSCAPE}
          gutterBottom={hasIMTR ? 0 : 16}
        >
          {cityScape
            ? `Het gebouw ligt in een beschermd stads- of dorpsgezicht.`
            : `Het gebouw ligt niet in een beschermd stads- of dorpsgezicht.`}
        </Paragraph>
      )}
      {!hasIMTR && !compact && (
        <>
          <Paragraph strong gutterBottom={0}>
            Bestemmingsplannen:
          </Paragraph>
          {zoningPlanNames.length === 0 ? (
            <Paragraph>Geen bestemmingsplannen</Paragraph>
          ) : (
            <List
              data-testid={LOCATION_ZONING_PLANS}
              style={{
                backgroundColor: "inherit",
                marginTop: 10,
                marginBottom: 0,
              }}
              variant="bullet"
            >
              {zoningPlanNames.map((planName: string) => (
                <ListItem key={planName}>{planName}</ListItem>
              ))}
            </List>
          )}
        </>
      )}
    </ComponentWrapper>
  );
};

export default RegisterLookupSummary;