import { Paragraph, themeSpacing } from "@amsterdam/asc-ui";
import styled from "styled-components";

export const StyledParagraph = styled(Paragraph)`
  /* IE11 Fix */
  flex-shrink: 0;

  /* Make all adjacent <ul> siblings closer to the Paragraph */
  & + ul {
    margin-top: -${themeSpacing(3)};
  }
`;
