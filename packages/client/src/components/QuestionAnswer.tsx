import { Paragraph } from "@amsterdam/asc-ui";
import { removeQuotes } from "@vergunningcheck/imtr-client";
import React from "react";

import { EditButton, TextToEdit } from "../atoms";
import ConclusionAlert from "./ConclusionAlert";

type QuestionAnswerProps = {
  disabled?: boolean;
  outcomeType: string;
  showConclusionAlert: boolean;
  userAnswer?: string;
};

const QuestionAnswer: React.FC<
  QuestionAnswerProps & React.HTMLAttributes<HTMLElement>
> = ({ disabled, onClick, outcomeType, showConclusionAlert, userAnswer }) => {
  if (!userAnswer) return null;
  return (
    <>
      <Paragraph gutterBottom={0}>
        <TextToEdit>{removeQuotes(userAnswer.toString())}</TextToEdit>
        <EditButton {...{ disabled, onClick }} />
      </Paragraph>
      {showConclusionAlert && (
        <ConclusionAlert marginBottom={8} {...{ outcomeType }} />
      )}
    </>
  );
};

export default QuestionAnswer;
