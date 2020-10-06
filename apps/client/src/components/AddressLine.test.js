import React from "react";

import addressMock from "../__mocks__/addressMock";
import { cleanup, render } from "../utils/test-utils";
import AddressLine from "./AddressLine";

afterEach(cleanup);

it("AddressLine renders correctly", () => {
  const { queryByText } = render(
    <AddressLine
      houseNumberFull={addressMock.houseNumberFull}
      postalCode={addressMock.postalCode}
      residence={addressMock.residence}
      streetName={addressMock.streetName}
    />
  );

  expect(queryByText("streetname 123")).toBeInTheDocument();
  expect(queryByText("1234 AB Amsterdam")).toBeInTheDocument();
});