import * as imtr from "@vergunningcheck/imtr-client";
import React from "react";

import Markdown from "../components/Markdown";
import {
  DemolitionNeedReport,
  DemolitionPermitFree,
  NeedPermit,
  PermitFree,
} from "../components/Outcome";
import { urls } from "../config";
import { eventNames, sections } from "../config/matomo";
import nl from "../i18n/nl";
import { OutcomeContentType } from "../types";

const {
  NEED_BOTH_PERMIT_AND_REPORT,
  NEED_CONTACT,
  NEED_PERMIT,
  NEED_REPORT,
  PERMIT_FREE,
} = imtr.ClientOutcomes;

/**
 *
 * This function returns the correct content to render in the Outcome components
 *
 * @param {checker} Checker - pass the complete checker
 * @param {slug} string - pass the slug
 * @returns {OutcomeContentType} - an object with Outcome content
 */
const getOutcomeContent = (checker: imtr.Checker, slug: string) => {
  // Get all the outcomes to display
  const outcomes = checker.getOutcomesToDisplay();

  // Get the 'NEED_CONTACT' content from 'imtr'
  const getNeedContactContent = outcomes.find(
    ({ outcome }: { outcome: string }) => outcome === imtr.outcomes.NEED_CONTACT
  );

  const contents = {
    default: {
      [NEED_BOTH_PERMIT_AND_REPORT]: {
        title:
          nl.translation.outcome.needBothPermitAndReport[
            "you need both permit and report"
          ],
      },
      [NEED_CONTACT]: {
        mainContent: (
          <Markdown
            eventLocation={sections.OUTCOME}
            source={getNeedContactContent?.description || ""}
          />
        ),
        title:
          getNeedContactContent?.title ||
          nl.translation.outcome.needContact["you need to contact the city"], // Fallback text
      },
      [NEED_PERMIT]: {
        mainContent: <NeedPermit />,
        title: nl.translation.outcome.needPermit["you need a permit"],
      },
      [NEED_REPORT]: {
        mainContent: (
          <NeedPermit contentText="Demo text for need permit outcome. We don't fully support this outcome yet" />
        ),
        title: nl.translation.outcome.needReport["you need a report"],
      },
      [PERMIT_FREE]: {
        footerContent: <PermitFree />,
        title: nl.translation.outcome.permitFree["you dont need a permit"],
      },
    },
    // This content is only relevant for the demolition checker
    demolition: {
      [NEED_CONTACT]: {
        title:
          getNeedContactContent?.title ||
          nl.translation.outcome.needContact["you need to contact the city"], // Fallback text
      },
      [NEED_BOTH_PERMIT_AND_REPORT]: {
        mainContent: (
          <NeedPermit
            contentText={
              nl.translation.outcome.needBothPermitAndReport[
                "on this page you can read more how to do apply for demolition"
              ]
            }
            eventName={eventNames.HOW_TO_APPLY_FOR_A_DEMOLITION}
            linkText={
              nl.translation.outcome.needBothPermitAndReport[
                "demolition permit and report"
              ]
            }
            url={urls.DEMOLITION_PERMIT_PAGE}
          />
        ),
        title:
          nl.translation.outcome.needBothPermitAndReport[
            "you need both permit and report for demolition"
          ],
      },
      [NEED_PERMIT]: {
        mainContent: <NeedPermit url={urls.DEMOLITION_PERMIT_PAGE} />,
        title:
          nl.translation.outcome.needPermit["you need a permit for demolition"],
      },
      [NEED_REPORT]: {
        mainContent: (
          // @TODO: refactor these components, because we use the `NeedPermit` component to render the need report content, because it looks the same
          // Maybe rename this to `OutcomeLink` or `OutcomeMainContent`
          <NeedPermit
            contentText={
              nl.translation.outcome.needReport[
                "on this page you can read more about report for demolition"
              ]
            }
            eventName={eventNames.HOW_TO_NOTIFY_A_DEMOLITION}
            linkText={
              nl.translation.outcome.needReport["how to report for demolition"]
            }
            url={urls.DEMOLITION_PERMIT_PAGE}
          />
        ),
        footerContent: <DemolitionNeedReport />,
        title:
          nl.translation.outcome.needReport["you need a report for demolition"],
      },
      [PERMIT_FREE]: {
        footerContent: <DemolitionPermitFree />,
        title:
          nl.translation.outcome.permitFree[
            "you dont need a permit for demolition"
          ],
      },
    },
    // This content is only relevant for the firesafety checker
    firesafety: {
      [NEED_CONTACT]: {
        /**
         * Warning: This outcome doesn't have a real "need contact" text,
         * but as long as we don't support multiple outcome texts for different routes,
         * we have to use this hack
         */
        mainContent: (
          <>
            <Markdown
              eventLocation={sections.OUTCOME}
              source={getNeedContactContent?.description || ""}
            />
            <NeedPermit
              contentText={
                nl.translation.outcome.needReport[
                  "on this page you can read more about report"
                ]
              }
              eventName={eventNames.HOW_TO_REPORT}
              linkText={nl.translation.outcome.needReport["how to report"]}
              url={urls.FIRESAFETY_PAGE}
            />
          </>
        ),
        title:
          nl.translation.outcome.needContact[
            "you need to contact for firesafety"
          ],
      },
      [NEED_BOTH_PERMIT_AND_REPORT]: {},
      [NEED_PERMIT]: {
        mainContent: <NeedPermit url={urls.FIRESAFETY_PAGE} />,
        title:
          nl.translation.outcome.needPermit[
            "you need a permit and not to report"
          ],
      },
      [NEED_REPORT]: {
        mainContent: (
          // @TODO: refactor these components, because we use the `NeedPermit` component to render the need report content, because it looks the same
          <NeedPermit
            contentText={
              nl.translation.outcome.needReport[
                "on this page you can read more about report"
              ]
            }
            eventName={eventNames.HOW_TO_REPORT}
            linkText={nl.translation.outcome.needReport["how to report"]}
            url={urls.FIRESAFETY_PAGE}
          />
        ),
        title:
          nl.translation.outcome.needReport["you need a report for firesafety"],
      },
      [PERMIT_FREE]: {
        title:
          nl.translation.outcome.permitFree[
            "you dont need a permit and dont need to report"
          ],
      },
    },
  };

  // Get the current outcome
  const outcomeType = checker.getClientOutcomeType();

  if (slug === "bouwwerk-slopen") {
    return contents.demolition[outcomeType] as OutcomeContentType;
  } else if (slug === "brandveilig-gebruik") {
    return contents.firesafety[outcomeType] as OutcomeContentType;
  }
  return contents.default[outcomeType] as OutcomeContentType;
};

export default getOutcomeContent;
