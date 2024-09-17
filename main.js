const quizContent = document.querySelector(".quiz-content");
const question = document.querySelector(".question");
const answers = document.querySelectorAll(".choices p");
const button = document.querySelector("button");
const currentQuestionSpan = document.querySelector(".current-q-num");
const questionsCountSpan = document.querySelector(".q-count");
const filledBar = document.querySelector(".bar .filled");

let level = 1;
let questionsCount = 10;
let qArray = [];
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
  if (currentQuestionIndex > questionsCount || !answered) return;
  console.log("question:" + currentQuestionIndex); // for debugging
  currentQuestionData = qArray[currentQuestionIndex - 1];
  question.innerHTML = `<span>${currentQuestionIndex}- </span>${currentQuestionData.q}`;
  Array.from(answers).forEach((element, index) => {
    element.textContent = currentQuestionData.answers[index].answer;
    element.classList.remove("selected", "right");
    element.style.cursor = "pointer";
  });
  currentQuestionSpan.textContent = currentQuestionIndex;
  filledBar.style.width = `${(currentQuestionIndex / questionsCount) * 100}%`;
  answered = false;
}

function checkAnswer(element) {
  if (answered) return;
  element.classList.add("selected");
  Array.from(answers).forEach((element, index) => {
    if (currentQuestionData.answers[index].t) element.classList.add("right");
    element.style.cursor = "default";
  });
  const rightAnswer =
    element.classList.contains("selected") &&
    element.classList.contains("right");
  if (rightAnswer) score++;
  console.log("score: " + score); // for debugging
  answered = true;
}

loadQuestions().then((qData) => {
  for (let i = 0; i < questionsCount; i++)
    qArray.push(qData.splice(Math.floor(Math.random() * qData.length), 1)[0]);
  console.log(qArray); // for debugging
  nextQuestion();
  questionsCountSpan.textContent = questionsCount;
  questionsCountSpan.style.visibility = "visible";
  currentQuestionSpan.style.visibility = "visible";
  question.style.visibility = "visible";
  Array.from(answers).forEach(
    (element) => (element.style.visibility = "visible"),
  );
  quizContent.style.transition = "opacity 1s";
  quizContent.style.opacity = "100%";
  button.addEventListener("click", nextQuestion);
  Array.from(answers).forEach((element) =>
    element.addEventListener("click", () => checkAnswer(element)),
  );
});
