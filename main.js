let level = 1;
let qArray = [];

async function loadQuestions() {
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
            for (let qObject of filePath) qArray.push(qObject);
          }
        }
      }
    }
    console.log(qArray);
  } catch (error) {
    console.log("Error: " + error);
  }
}
