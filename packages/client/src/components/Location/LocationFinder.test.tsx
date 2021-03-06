import { ApolloError } from "@apollo/client";
import React, { FunctionComponent, useState } from "react";

import locationFinderGraphQLMocks from "../../__mocks__/locationFinderGraphQLMocks";
import text from "../../i18n/nl";
import {
  AUTOSUGGEST_ITEM,
  AUTOSUGGEST_LIST,
  LOCATION_FOUND,
  LOCATION_NOT_FOUND,
} from "../../utils/test-ids";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "../../utils/test-utils";
import LocationFinder from "./LocationFinder";

const setAddress = jest.fn();
const mockSetError = jest.fn();

jest.mock("react-router-dom", () => ({
  useParams: () => ({}),
}));

describe("LocationFinder", () => {
  const Wrapper: FunctionComponent = () => {
    const [errorMessage, setError] = useState<ApolloError | undefined>();

    const handleError = (message?: ApolloError) => {
      setError(message);
      mockSetError(message);
    };

    return (
      <LocationFinder
        sessionAddress={null}
        setError={handleError}
        {...{ errorMessage, setAddress }}
      />
    );
  };

  it("should render correctly (including autosuggest)", async () => {
    render(<Wrapper />, {}, locationFinderGraphQLMocks);

    const inputPostalCode = screen.getByLabelText(
      text.translation.common["postalcode label"]
    );
    const inputHouseNumber = screen.getByLabelText(
      text.translation.common["housenumber label"]
    );

    expect(inputPostalCode).toHaveValue("");
    expect(inputHouseNumber).toHaveValue("");

    // Change the input values to make sure the location is "not found"
    await act(async () => {
      fireEvent.change(inputPostalCode, {
        target: { value: "1055XD" },
      });
      fireEvent.change(inputHouseNumber, {
        target: { value: "1" },
      });
    });

    await waitFor(() =>
      screen.queryByText(text.translation.common["address loading"])
    );

    expect(inputPostalCode).toHaveValue("1055XD");
    expect(inputHouseNumber).toHaveValue("1");

    await waitFor(() => screen.getByTestId(LOCATION_NOT_FOUND));

    // Change the input values to display the autosuggest
    await act(async () => {
      fireEvent.focus(inputHouseNumber);

      fireEvent.keyDown(inputHouseNumber, {
        target: { value: "19" },
      });

      fireEvent.change(inputHouseNumber);
    });

    await waitFor(() => screen.getByTestId(AUTOSUGGEST_LIST));
    expect(screen.queryAllByTestId(AUTOSUGGEST_ITEM).length).toBe(6);
    expect(screen.queryByText("19 C")).toBeInTheDocument();

    // Press Enter to make sure the location is "not found" (again)
    await act(async () => {
      fireEvent.keyDown(inputHouseNumber, {
        key: "Enter",
      });
    });

    await waitFor(() =>
      screen.queryByText(text.translation.common["address loading"])
    );
    await waitFor(() => screen.getByTestId(LOCATION_NOT_FOUND));

    // Enable the autosuggest (again)
    await act(async () => {
      fireEvent.focus(inputHouseNumber);
    });

    // Select an option from the autosuggest and make sure the location is found
    await act(async () => {
      fireEvent.mouseDown(screen.queryByText("19 C") as HTMLElement);
    });

    await waitFor(() =>
      screen.queryByText(text.translation.common["address loading"])
    );
    await waitFor(() => screen.getByTestId(LOCATION_FOUND));
  });

  it("should render multiple housenumber types", async () => {
    render(<Wrapper />, {}, locationFinderGraphQLMocks);

    const inputPostalCode = screen.getByLabelText(
      text.translation.common["postalcode label"]
    );
    const inputHouseNumber = screen.getByLabelText(
      text.translation.common["housenumber label"]
    );

    expect(inputPostalCode).toHaveValue("");
    expect(inputHouseNumber).toHaveValue("");

    await act(async () => {
      fireEvent.change(inputPostalCode, {
        target: { value: "1024BV" },
      });
      fireEvent.change(inputHouseNumber, {
        target: { value: "546 K 1" },
      });
    });

    await waitFor(() =>
      screen.queryByText(text.translation.common["address loading"])
    );
    await waitFor(() => screen.getByTestId(LOCATION_FOUND));

    await act(async () => {
      fireEvent.change(inputPostalCode, {
        target: { value: "1024BV" },
      });
      fireEvent.change(inputHouseNumber, {
        target: { value: "546k1" },
      });
    });

    await waitFor(() =>
      screen.queryByText(text.translation.common["address loading"])
    );
    await waitFor(() => screen.getByTestId(LOCATION_FOUND));

    await act(async () => {
      fireEvent.change(inputPostalCode, {
        target: { value: "1024BV" },
      });
      fireEvent.change(inputHouseNumber, {
        target: { value: "546 k1" },
      });
    });

    await waitFor(() =>
      screen.queryByText(text.translation.common["address loading"])
    );
    await waitFor(() => screen.getByTestId(LOCATION_FOUND));

    await act(async () => {
      fireEvent.change(inputPostalCode, {
        target: { value: "1024BV" },
      });
      fireEvent.change(inputHouseNumber, {
        target: { value: "546k 1" },
      });
    });

    await waitFor(() =>
      screen.queryByText(text.translation.common["address loading"])
    );
    await waitFor(() => screen.getByTestId(LOCATION_FOUND));

    await act(async () => {
      fireEvent.change(inputPostalCode, {
        target: { value: "1024BV" },
      });
      fireEvent.change(inputHouseNumber, {
        target: { value: "546 k 1" },
      });
    });

    await waitFor(() =>
      screen.queryByText(text.translation.common["address loading"])
    );
    await waitFor(() => screen.getByTestId(LOCATION_FOUND));

    await act(async () => {
      fireEvent.change(inputPostalCode, {
        target: { value: "1027AE" },
      });
      fireEvent.change(inputHouseNumber, {
        target: { value: "20 H L" },
      });
    });

    await waitFor(() =>
      screen.queryByText(text.translation.common["address loading"])
    );
    await waitFor(() => screen.getByTestId(LOCATION_FOUND));

    await act(async () => {
      fireEvent.change(inputPostalCode, {
        target: { value: "1027AE" },
      });
      fireEvent.change(inputHouseNumber, {
        target: { value: "20 HL" },
      });
    });

    await waitFor(() =>
      screen.queryByText(text.translation.common["address loading"])
    );
    await waitFor(() => screen.getByTestId(LOCATION_FOUND));

    await act(async () => {
      fireEvent.change(inputPostalCode, {
        target: { value: "1027AE" },
      });
      fireEvent.change(inputHouseNumber, {
        target: { value: "20hl" },
      });
    });

    await waitFor(() =>
      screen.queryByText(text.translation.common["address loading"])
    );
    await waitFor(() => screen.getByTestId(LOCATION_FOUND));

    await act(async () => {
      fireEvent.change(inputPostalCode, {
        target: { value: "1027AE" },
      });
      fireEvent.change(inputHouseNumber, {
        target: { value: "20 hl" },
      });
    });

    await waitFor(() =>
      screen.queryByText(text.translation.common["address loading"])
    );
    await waitFor(() => screen.getByTestId(LOCATION_FOUND));
  });

  it("should handle errors", async () => {
    render(<Wrapper />, {}, locationFinderGraphQLMocks);

    const inputPostalCode = screen.getByLabelText(
      text.translation.common["postalcode label"]
    );
    const inputHouseNumber = screen.getByLabelText(
      text.translation.common["housenumber label"]
    );

    // This detects an invalid postalCode
    await act(async () => {
      fireEvent.focus(inputPostalCode);
      fireEvent.change(inputPostalCode, {
        target: { value: "1055" },
      });
      fireEvent.blur(inputPostalCode);
    });

    await waitFor(() =>
      screen.queryByText(text.translation.common["address loading"], {
        exact: false,
      })
    );

    // This address forces graphql errors
    await act(async () => {
      fireEvent.change(inputPostalCode, {
        target: { value: "6666AB" },
      });
      fireEvent.change(inputHouseNumber, {
        target: { value: "666" },
      });
    });

    expect(mockSetError).toHaveBeenCalled();
    expect(mockSetError).not.toHaveBeenCalledWith(undefined);

    // Reset the graphql errors
    await act(async () => {
      fireEvent.change(inputPostalCode, {
        target: { value: "1027AE" },
      });
      fireEvent.change(inputHouseNumber, {
        target: { value: "20 HL" },
      });
    });
    await waitFor(() => screen.getByTestId(LOCATION_FOUND));

    expect(mockSetError).toHaveBeenCalledWith(undefined);
  });
});
