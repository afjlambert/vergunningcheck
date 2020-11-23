import { ErrorMessage, Paragraph } from "@amsterdam/asc-ui";
import { ApolloError, useQuery } from "@apollo/client";
import { loader } from "graphql.macro";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Alert, ComponentWrapper } from "../../atoms";
import { actions, eventNames } from "../../config/matomo";
import { useTopicData, useTracking } from "../../hooks";
import useDebounce from "../../hooks/useDebounce";
import { isValidPostalcode, stripString } from "../../utils";
import { LOCATION_FOUND } from "../../utils/test-ids";
import AutoSuggestList, { Option } from "../AutoSuggestList";
import LocationLoading from "./LocationLoading";
import LocationNotFound from "./LocationNotFound";
import { LocationTextField } from "./LocationStyles";
import LocationSummary from "./LocationSummary";

const findAddress = loader("./LocationFinder.graphql");

const RESULT_DELAY = 750;

// This makes sure the exactMatch is equal to the user input
const isTrueExactMatch = (
  match?: { houseNumberFull?: string },
  houseNumberFull?: string
) =>
  houseNumberFull &&
  stripString(match?.houseNumberFull) === stripString(houseNumberFull);

type LocationFinderProps = {
  focus: boolean;
  sessionAddress: any; // @TODO replace any with address type.
  setErrorMessage: (error: ApolloError | undefined) => void;
  setFocus: (focus: boolean) => void;
};

const LocationFinder: React.FC<LocationFinderProps> = ({
  focus,
  sessionAddress,
  setErrorMessage,
  setFocus,
}) => {
  const { matomoTrackEvent } = useTracking();
  const { setTopicData } = useTopicData();
  const { t } = useTranslation();
  const [showResult, setShowResult] = useState<boolean>(true);
  const [postalCode, setPostalCode] = useState<string>(
    sessionAddress.postalCode
  );
  const [houseNumber, setHouseNumber] = useState<number>(
    sessionAddress?.houseNumber && parseInt(sessionAddress.houseNumber)
  );
  const [houseNumberFull, setHouseNumberFull] = useState<string>(
    sessionAddress?.houseNumberFull
  );
  const [autoSuggestValue, setAutoSuggestValue] = useState<string>("");
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const variables = {
    extraHouseNumberFull: "",
    houseNumberFull: houseNumberFull,
    postalCode,
    queryExtra: false,
  };

  // Validate forms
  const validate = (
    name: string,
    value: number | string,
    required: boolean
  ) => {
    if (touched[name]) {
      if (required && (!value || value?.toString().trim() === "")) {
        return t("common.required field text");
      }
      if (name === "postalCode" && !isValidPostalcode(value.toString())) {
        return "Dit is geen geldige postcode. Een postcode bestaat uit 4 cijfers en 2 letters.";
      }
    }
    return undefined;
  };

  // Error messages
  const houseNumberError = validate("houseNumber", houseNumber, true);
  const postalCodeError = validate("postalCode", postalCode, true);

  // Handle all the keys
  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case "Enter":
          // Prevent submitting the form when pressing Enter
          event.preventDefault();
          // Disable focus on the input so the AutoSugest list disappears
          (document.activeElement as HTMLElement).blur();
          setFocus(false);
          break;

        default:
          // Reset the autoSuggestValue on each key press to prevent bugs
          setAutoSuggestValue("");
          break;
      }
    },
    [setFocus]
  );

  /* There is an issue with `skip`, it's not working if variables are given
     in `options` to `useQuery`. See https://github.com/apollographql/react-apollo/issues/3367
     Workaround is not giving any variables if the query should be skipped. */
  const skip = !!(
    houseNumberError ||
    !houseNumberFull ||
    !postalCode ||
    !isValidPostalcode(postalCode) ||
    postalCodeError
  );
  const { loading, error: graphqlError, data } = useQuery(findAddress, {
    variables: skip ? undefined : variables,
    skip,
  });

  const allowToSetAddress = !!(
    houseNumber &&
    houseNumberFull &&
    isValidPostalcode(postalCode) &&
    !loading &&
    (data || graphqlError)
  );

  const exactMatch = data?.findAddress?.exactMatch;

  // This makes sure the exactMatch is equal to the user input
  const isExactMatch = isTrueExactMatch(exactMatch, houseNumberFull);

  // Prevent setState error
  useEffect(() => {
    if (allowToSetAddress) {
      setTopicData({ address: exactMatch });
    }
  }, [allowToSetAddress, exactMatch, setTopicData]);

  // GraphQL error
  useEffect(() => {
    if (graphqlError) {
      setErrorMessage(graphqlError);
      matomoTrackEvent({
        action: actions.ERROR,
        name: eventNames.ADDRESS_API_DOWN,
      });
    }
  }, [graphqlError, matomoTrackEvent, setErrorMessage]);

  const handleBlur = (e: { target: { name: string; value: string } }) => {
    // This fixes the focus error
    e.target.value && setTouched({ ...touched, [e.target.name]: true });
    setFocus(false);
  };

  // AutoSuggest
  const handleAutoSuggestSelect = (option: Option) => {
    const { value } = option;
    setShowResult(false);
    debouncedUpdateResult();

    setHouseNumber(parseInt(value));
    setHouseNumberFull(value);
    setAutoSuggestValue(value);
  };
  const autoSuggestMatches =
    data?.findAddress.matches.filter(
      (a: { houseNumberFull: string }) =>
        stripString(a.houseNumberFull) !== stripString(houseNumberFull)
    ) || [];
  const showAutoSuggest = autoSuggestMatches.length > 0 && focus;

  const options = autoSuggestMatches.map(
    (address: { houseNumberFull: string }) => ({
      id: address.houseNumberFull.replace(" ", "-"),
      value: address.houseNumberFull,
    })
  );

  // Determine when to show components
  const showExactMatch = isExactMatch && !loading;

  const showLocationNotFound = !!(
    houseNumberFull &&
    isValidPostalcode(postalCode) &&
    showResult &&
    !isExactMatch &&
    !loading &&
    !graphqlError &&
    !showAutoSuggest
  );

  const showLoading = !!(
    houseNumberFull &&
    isValidPostalcode(postalCode) &&
    !showAutoSuggest &&
    !showExactMatch &&
    !showLocationNotFound &&
    !showResult
  );

  // Debounce showing the LocationNotFound component
  const updateResult = useCallback(() => {
    setShowResult(true);
  }, []);

  const debouncedUpdateResult = useDebounce(updateResult, RESULT_DELAY);

  const handleChange = useCallback(
    (event) => {
      const { value } = event.target;
      setHouseNumber(parseInt(value));
      setHouseNumberFull(value);

      if (value) {
        // Allow references to the event to be retained
        event.persist();
        setShowResult(false);
        debouncedUpdateResult();
      }
    },
    [debouncedUpdateResult]
  );

  // @TODO: we can refactor this component by separating all inputs and input handles

  return (
    <>
      <ComponentWrapper>
        <LocationTextField
          autoFocus={!postalCode}
          defaultValue={postalCode}
          error={
            !!postalCodeError ||
            (showLocationNotFound && isValidPostalcode(postalCode))
          }
          label="Postcode"
          name="postalCode"
          onBlur={handleBlur}
          onChange={(e) => {
            setPostalCode(e.target.value);
          }}
          onFocus={() => setFocus(true)}
          required
          spellCheck={false}
        />
        {postalCodeError && <ErrorMessage message={postalCodeError} />}
      </ComponentWrapper>

      <ComponentWrapper>
        <LocationTextField
          autoComplete="off" // This disables the native browser auto-suggest
          error={
            !!houseNumberError ||
            (showLocationNotFound && isValidPostalcode(postalCode))
          }
          id="houseNumberFull"
          label="Huisnummer + toevoeging"
          name="houseNumberFull"
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={() => setFocus(true)}
          onKeyDown={handleKeyDown}
          required
          spellCheck={false}
          value={houseNumberFull || autoSuggestValue}
        />

        {houseNumberError && <ErrorMessage message={houseNumberError} />}

        {showAutoSuggest && (
          <AutoSuggestList
            // @TODO: make activeIndex dynamic (WCAG)
            activeIndex={-1}
            onSelectOption={handleAutoSuggestSelect}
            options={options}
            role="listbox"
          />
        )}
      </ComponentWrapper>

      <LocationLoading loading={showLoading || loading} />

      {showLocationNotFound && <LocationNotFound />}

      {showExactMatch && (
        <>
          <ComponentWrapper marginBottom={16}>
            <Alert data-testid={LOCATION_FOUND} level="info">
              <Paragraph gutterBottom={8} strong>
                Dit is het gekozen adres:
              </Paragraph>
              <LocationSummary
                addressFromLocation={exactMatch}
                isBelowInputFields
                showTitle
              />
            </Alert>
          </ComponentWrapper>
          <Paragraph gutterBottom={32}>
            Klopt het adres niet? Wijzig dan postcode of huisnummer.
          </Paragraph>
        </>
      )}
    </>
  );
};

export default LocationFinder;
