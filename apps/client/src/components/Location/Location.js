import { Paragraph } from "@datapunt/asc-ui";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";

import { Flow, OLO } from "../../config";
import { CheckerContext, SessionContext } from "../../context";
import withTopic from "../../hoc/withTopic";
import { geturl, routes } from "../../routes";
import { ADDRESS_PAGE } from "../../utils/test-ids";
import AddressLine from "../AddressLine";
import Error from "../Error";
import Form from "../Form";
import Nav from "../Nav";
import RegisterLookupSummary from "../RegisterLookupSummary";
import LocationFinder from "./LocationFinder";

const Location = ({ topic, finishedLocation, setFinishedLocation }) => {
  const { trackEvent } = useMatomo();
  const sessionContext = useContext(SessionContext);
  const checkerContext = useContext(CheckerContext);
  const history = useHistory();
  const [addressShown, setAddressShown] = useState(false);
  const [address, setAddress] = useState(null);
  const [focus, setFocus] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const { clearErrors, errors, register, unregister, handleSubmit } = useForm();
  const { slug } = topic;
  const text = topic.text || {};
  const sessionAddress = sessionContext[slug]?.address || {};
  const useOLO = topic.flow === Flow.olo;

  useEffect(() => {
    if (!address && !errorMessage) {
      register({ name: "suffix" }, { required: "Kies een toevoeging." });
    } else {
      clearErrors("suffix");
    }
    return () => unregister("suffix");
  }, [address, clearErrors, errorMessage, register, unregister]);

  const onSubmit = () => {
    if (address) {
      trackEvent({
        category: "postcode-input",
        action: `postcode - ${slug.replace("-", " ")}`,
        name: address.postalCode.substring(0, 4),
      });

      // Load given answers from sessionContext
      let answers = sessionContext[slug]?.answers;

      // Reset the checker and answers when the address is changed
      if (answers && sessionAddress.id !== address.id) {
        checkerContext.checker = null;
        answers = null;
      }

      checkerContext.autofillData.address = address;

      sessionContext.setSessionData([
        slug,
        {
          address,
          answers, // Either null or filled with given answers
          questionIndex: 0, // Reset to 0 to start with the first question
        },
      ]);

      if (focus) {
        document.activeElement.blur();
      } else {
        setAddressShown(true);
        if (checkerContext.checker) {
          checkerContext.checker.next();
        }
      }
    }
  };
  const getOloUrl = ({ postalCode, houseNumberFull, houseNumber }) => {
    // Form is validated, we can proceed

    // Generate OLO parameter "postalCode"
    const oloPostalCode = `facet_locatie_postcode=${postalCode}`;

    // Generate OLO parameter "streetNumber"
    const oloStreetNumber = `facet_locatie_huisnummer=${houseNumber}`;

    const oloSuffix = `facet_locatie_huisnummertoevoeging=${houseNumberFull
      .replace(houseNumber, "")
      .trim()}`;

    // Redirect user to OLO with all parameters
    return `${OLO.location}?param=postcodecheck&${oloPostalCode}&${oloStreetNumber}&${oloSuffix}`;
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (useOLO) {
      window.open(getOloUrl(address), "_blank");
    } else {
      setFinishedLocation(true);
    }
  };

  if (addressShown) {
    return (
      <Form onSubmit={handleAddressSubmit} data-testid={ADDRESS_PAGE}>
        <Paragraph>
          Over <AddressLine address={address} /> hebben we de volgende
          informatie gevonden:
        </Paragraph>

        <RegisterLookupSummary displayZoningPlans={useOLO} address={address} />

        <Paragraph>
          {useOLO
            ? `U hebt deze informatie nodig om de vergunningcheck te doen op het Omgevingsloket. `
            : `We gebruiken deze informatie bij het invullen van de vergunningcheck. `}
        </Paragraph>
        {topic.text?.addressPage && (
          <Paragraph>{topic.text.addressPage}</Paragraph>
        )}

        {!finishedLocation && (
          <Nav
            onGoToPrev={() => setAddressShown(false)}
            nextText={useOLO ? "Naar het omgevingsloket" : "Naar de Vragen"}
            formEnds={useOLO}
            showPrev
            showNext
          />
        )}
      </Form>
    );
  }

  return (
    <>
      {errorMessage && (
        <Error
          heading="Helaas. Wij kunnen nu geen locatiegegevens opvragen waardoor u deze check op dit moment niet kunt doen."
          stack={errorMessage?.stack}
        >
          <Paragraph>
            Probeer het later opnieuw. Of neem contact op met de gemeente op
            telefoonnummer <a href="tel:14020">14 020</a>.
          </Paragraph>
        </Error>
      )}
      {text.locationIntro && <Paragraph>{text.locationIntro}.</Paragraph>}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <LocationFinder
          setAddress={setAddress}
          setFocus={setFocus}
          setErrorMessage={setErrorMessage}
          postalCode={sessionAddress.postalCode}
          houseNumberFull={sessionAddress.houseNumberFull}
          houseNumber={sessionAddress.houseNumberFull}
          errors={errors}
        />
        <Nav
          onGoToPrev={() => {
            sessionContext.setSessionData([
              slug,
              {
                address,
              },
            ]);
            history.push(geturl(routes.intro, topic));
          }}
          showNext
        />
      </Form>
    </>
  );
};

export default withTopic(Location);
