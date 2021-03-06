import { getQuestionConfig } from "../utils/mocks";
import Checker from "./checker";
import Decision from "./decision";
import Permit from "./permit";
import Question from "./question";
import Rule from "./rule";

const getQuestions = () => {
  return [
    new Question(getQuestionConfig({ prio: 10, type: "boolean" })),
    new Question(getQuestionConfig({ prio: 20, type: "boolean" })),
  ];
};

const getChecker = (questions: Question[]) => {
  const d1 = new Decision("dummy", questions, [
    new Rule([false], "no"),
    new Rule([true, false], "not sure"),
    new Rule([true, true], "yes"),
  ]);
  const dummy = new Decision(
    "dummy",
    [d1],
    [
      new Rule(["no"], "nope"),
      new Rule(["not sure"], "what?"),
      new Rule(["yes"], "hell yeah"),
    ]
  );
  return new Checker([new Permit("drivers-licence", 23, [dummy])]);
};

describe("Checker", () => {
  test("permit order", () => {
    const d1 = new Decision(
      "a",
      [new Question(getQuestionConfig({ prio: 10, type: "boolean" }))],
      []
    );
    const d2 = new Decision(
      "b",
      [
        new Question(getQuestionConfig({ prio: 10, type: "boolean" })),
        new Question(getQuestionConfig({ prio: 20, type: "boolean" })),
      ],
      []
    );
    const p1 = new Permit("permit-1-question", 23, [d1]);
    const p2 = new Permit("permit-2-questions", 23, [d2]);
    const c1 = new Checker([p1, p2]);
    const c2 = new Checker([p2, p1]);
    expect(c1.permits).toStrictEqual([p1, p2]);
    expect(c2.permits).toStrictEqual([p1, p2]);
  });
});

describe("Checker recursive", () => {
  test("initialization", () => {
    const questions = getQuestions();

    const d1 = new Decision(
      "a",
      [questions[0]],
      [new Rule([true], "fun!"), new Rule([false], "boring")]
    );
    const d2 = new Decision("b", questions, [
      new Rule([true, false], "non local"),
      new Rule([true, true], "local"),
    ]);
    const d3 = new Decision(
      "dummy",
      [d1, d2],
      [
        new Rule(["boring"], "Maybe you should move?"),
        new Rule(["fun!", "non local"], "Hi Robin or Sven"),
        new Rule(["fun!", "local"], "Hi André"),
      ]
    );
    const checker = new Checker([new Permit("some permit", 22, [d1, d2, d3])]);

    let question = checker.next() as Question;
    expect(question).toBe(questions[0]);
    question.setAnswer(true);
    question = checker.next() as Question;
    question.setAnswer(true);
    expect(checker.permits[0].getOutputByDecisionId("dummy")).toBe("Hi André");

    question = checker.rewindTo(0);
    question.setAnswer(true);
    question = checker.next() as Question;
    question.setAnswer(false);
    expect(checker.permits[0].getOutputByDecisionId("dummy")).toBe(
      "Hi Robin or Sven"
    );

    question = checker.rewindTo(0);
    question.setAnswer(false);
    expect(checker.permits[0].getOutputByDecisionId("dummy")).toBe(
      "Maybe you should move?"
    );
  });

  test("initialization after refresh", () => {
    const questions = getQuestions();
    const checker = getChecker(questions);
    const question = checker.next() as Question;
    question.setAnswer(true);

    const data = checker.getQuestionAnswers();
    const freshChecker = getChecker(questions);
    freshChecker.setQuestionAnswers(data);
    expect(freshChecker.rewindTo(0).answer).toBe(true);
  });
});

describe("Checker internals", () => {
  const qShared = new Question(
    getQuestionConfig({
      text: "shared question",
      prio: 10,
      type: "boolean",
      autofill: "yes please",
    })
  );

  const q1 = new Question(getQuestionConfig({ prio: 20, type: "boolean" }));
  const d1 = new Decision("d1", [qShared, q1], [new Rule([false], "z")]);
  const dummy1 = new Decision("dummy", [d1], [new Rule([true], "y")]);
  const permit1 = new Permit("x", 1, [dummy1]);

  const q2 = new Question(getQuestionConfig({ prio: 30, type: "boolean" }));
  const d2 = new Decision("d2", [qShared, q2], [new Rule([false], "z")]);
  const dummy2 = new Decision("dummy", [d2], [new Rule([false], "x")]);
  const permit2 = new Permit("y", 1, [dummy2]);

  const checker = new Checker([permit1, permit2]);

  test("_getOutcomeDecisions", () => {
    expect(checker._getOutcomeDecisions()).toStrictEqual([d1, d2]);
  });

  test("_getAllQuestions", () => {
    expect(checker._getAllQuestions()).toStrictEqual([qShared, q1, q2]);
  });

  test("getUpcomingQuestions", () => {
    expect(checker.getUpcomingQuestions()).toStrictEqual([q1, q2]);
    checker.next();
    expect(checker.stack).toStrictEqual([q1]);
    q1.setAnswer(true);

    expect(checker.getUpcomingQuestions()).toStrictEqual([q2]);
    const next = checker.next();
    expect(next).toStrictEqual(q2);
    expect(checker.getUpcomingQuestions()).toStrictEqual([]);
  });
});

describe("Checker navigation", () => {
  test("next", () => {
    const questions = getQuestions();
    const checker = getChecker(questions);
    const question = checker.next() as Question; // first
    expect(question).toBe(questions[0]);
    expect(question.answer).toBe(undefined);
    expect(checker.permits[0].getOutputByDecisionId("dummy")).toBe(undefined);

    expect(() => checker.next()).toThrow("Please answer the question first");
  });

  test("rewindTo", () => {
    const questions = getQuestions();
    const checker = getChecker(questions);
    let question = checker.next() as Question;
    question.setAnswer(true);
    question = checker.next() as Question;
    question.setAnswer(false);
    question = checker.rewindTo(1); // also known as _current in this case
    expect(question).toBe(questions[1]);
    question = checker.rewindTo(0);
    expect(question).toBe(questions[0]);
  });

  test("remember answers", () => {
    const questions = getQuestions();
    const checker = getChecker(questions);
    // set some answers
    let question = checker.next() as Question;
    question.setAnswer(true);
    question = checker.next() as Question;
    question.setAnswer(false);

    // rewind 1 question and validate answers still there
    question = checker.previous();
    expect(question.answer).toBe(true);
    question = checker.next() as Question;
    expect(question.answer).toBe(false);

    // rewind with goto should also preserve answers
    question = checker.rewindTo(0);
    expect(question.answer).toBe(true);
    question = checker.next() as Question;
    expect(question.answer).toBe(false);
  });

  test("previous", () => {
    const questions = getQuestions();
    const checker = getChecker(questions);
    let question = checker.next() as Question; // first
    question.setAnswer(true);
    question = checker.next() as Question; // second
    expect(question).toBe(questions[1]);
    question = checker.previous();
    expect(question).toBe(questions[0]);
    expect(() => checker.previous()).toThrow(
      "'rewindTo' index cannot be less then 0"
    );
  });

  test("done + previous", () => {
    const questions = getQuestions();
    const checker = getChecker(questions);
    let question = checker.next() as Question;
    question.setAnswer(true);
    question = checker.next() as Question;
    question.setAnswer(true);
    question = checker.next() as Question;
    expect(question).toBe(null);
    question = checker.previous();
    expect(question).toBe(questions[1]);
  });
});
