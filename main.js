const quizContent = document.querySelector(".quiz-content");
const question = document.querySelector(".quiz-content .question");
const answers = document.querySelectorAll(".choices a");
const nextButton = document.querySelector(".next-q-btn");
const currentQuestionSpan = document.querySelector(".current-q-num");
const questionsCountSpan = document.querySelector(".q-count");
const filledBar = document.querySelector(".bar .filled");
const result = document.querySelector("div.result");
const repeatButton = document.querySelector(".repeat-btn");
const qaButton = document.querySelector(".q-a-btn");
const qaList = document.querySelector(".q-a-list");

let level = 1;
let questionsCount = 5;
let qArray = [];
let selectedIndexes = [];
let rightIndexes = [];
let currentQuestionIndex = 0;
let answered = true;
let currentQuestionData;
let score = 0;

async function loadQuestions() {
  let qData = [];
  try {
    const mainResponse = await fetch("database/main.json");
    const mainData = await mainResponse.json();
    const categories = mainData["categories"];
    for (let category of categories) {
      const categoryResponse = await fetch(category["path"]);
      const categoryData = await categoryResponse.json();
      const dataArray = categoryData["DataArray"];
      for (let dataItem of dataArray) {
        const files = dataItem["files"];
        for (let file of files) {
          if (file["level"] === level) {
            const fileResponse = await fetch(file["path"]);
            const filePath = await fileResponse.json();
            for (let qObject of filePath) qData.push(qObject);
          }
        }
      }
    }
    return qData;
  } catch (error) {
    console.log("Error: " + error);
  }
}

function nextQuestion() {
  currentQuestionIndex++;
  if (!answered) return;
  else if (currentQuestionIndex > questionsCount) {
    quizContent.remove();
    document.querySelector(".result .score").textContent = score;
    document.querySelector(".result .max-score").textContent = questionsCount;
    result.style.visibility = "visible";
    result.style.transition = "opacity 2s";
    result.style.opacity = "100%";
  }
  currentQuestionData = qArray[currentQuestionIndex - 1];
  question.innerHTML = `<span>${currentQuestionIndex}- </span>${currentQuestionData.q}`;
  Array.from(answers).forEach((element, index) => {
    element.textContent = currentQuestionData.answers[index].answer;
    element.classList.remove("selected", "right");
    element.style.cursor = "pointer";
  });
  currentQuestionSpan.textContent = currentQuestionIndex;
  filledBar.style.width = `${(currentQuestionIndex / questionsCount) * 100}%`;
  if (currentQuestionIndex === questionsCount)
    nextButton.children[0].textContent = "إنهاء الاختبار";
  answered = false;
}

function checkAnswer(element, elementOrder) {
  if (answered) return;
  element.classList.add("selected");
  selectedIndexes.push(elementOrder);
  Array.from(answers).forEach((element, index) => {
    if (currentQuestionData.answers[index].t) {
      element.classList.add("right");
      rightIndexes.push(index);
    }
    element.style.cursor = "default";
  });
  const rightAnswer =
    element.classList.contains("selected") &&
    element.classList.contains("right");
  if (rightAnswer) score++;
  answered = true;
}

function showQuestionsAndAnswersPage() {
  const div = document.createElement("div");
  qaList.appendChild(div);
  div.style.paddingBottom = "20px";
  for (let i = 0; i < questionsCount; i++) {
    const q = document.createElement("p");
    div.appendChild(q);
    q.classList.add(`question-${i + 1}`);
    q.innerHTML = `<span>${i + 1}- </span>${qArray[i].q}`;
    q.style.marginBottom = "5px";
    const learnMore = document.createElement("a");
    div.appendChild(learnMore);
    learnMore.href = qArray[i].link;
    learnMore.target = "_blank";
    learnMore.classList.add("learn-more");
    learnMore.textContent = "<< تعلم أكثر حول المسألة >>";
    const choices = document.createElement("div");
    div.appendChild(choices);
    choices.classList.add(`choices-${i + 1}`);
    const choice1 = document.createElement("a");
    choices.appendChild(choice1);
    choice1.textContent = qArray[i].answers[0].answer;
    choice1.style.cursor = "default";
    const choice2 = document.createElement("a");
    choices.appendChild(choice2);
    choice2.textContent = qArray[i].answers[1].answer;
    choice2.style.cursor = "default";
    const choice3 = document.createElement("a");
    choices.appendChild(choice3);
    choice3.textContent = qArray[i].answers[2].answer;
    choice3.style.cursor = "default";
    choices.children.item(selectedIndexes[i]).classList.add("selected");
    choices.children.item(rightIndexes[i]).classList.add("right");
  }
  const repeat = document.createElement("button");
  div.appendChild(repeat);
  repeat.classList.add("repeat");
  repeat.textContent = "الاختبار مرة أخرى";
  repeat.addEventListener("click", () => window.location.reload());
}

loadQuestions().then((qData) => {
  for (let i = 0; i < questionsCount; i++)
    qArray.push(qData.splice(Math.floor(Math.random() * qData.length), 1)[0]);
  nextQuestion();
  questionsCountSpan.textContent = questionsCount;
  quizContent.style.transition = "opacity 1s";
  quizContent.style.opacity = "100%";
  nextButton.addEventListener("click", nextQuestion);
  Array.from(answers).forEach((element, index) =>
    element.addEventListener("click", () => checkAnswer(element, index)),
  );
  repeatButton.addEventListener("click", () => window.location.reload());
  qaButton.addEventListener("click", () => {
    result.remove();
    document.querySelector(".footer-bg").remove();
    showQuestionsAndAnswersPage();
  });
});
