let fruitChart;
let currentFruit = null;

async function searchFruit() {
  const fruitInput = document.getElementById("fruit").value.toLowerCase();
  const resultSpot = document.getElementById("fruitResultsSpot");

  if (fruitInput === "") {
    Swal.fire("Oops!", "Please enter a fruit name.", "warning");
    return;
  }

  resultSpot.innerHTML = "<p>Loading fruit data...</p>";

  try {
    const response = await fetch(`/api/fruit/${fruitInput}`);

    if (!response.ok) {
      throw new Error("Fruit not found");
    }

    const fruitData = await response.json();

    currentFruit = fruitData;

    resultSpot.innerHTML = `
      <h3>${fruitData.name}</h3>
      <p><strong>Family:</strong> ${fruitData.family}</p>
      <p><strong>Genus:</strong> ${fruitData.genus}</p>
      <p><strong>Calories:</strong> ${fruitData.nutritions.calories}</p>
      <p><strong>Sugar:</strong> ${fruitData.nutritions.sugar}</p>
      <p><strong>Carbs:</strong> ${fruitData.nutritions.carbohydrates}</p>
      <p><strong>Protein:</strong> ${fruitData.nutritions.protein}</p>
      <p><strong>Fat:</strong> ${fruitData.nutritions.fat}</p>
      <button onclick="saveFruit()">Save Fruit</button>
    `;

    makeFruitChart(fruitData);

  } catch (error) {
    resultSpot.innerHTML = "<p>Fruit not found. Try apple, banana, or strawberry.</p>";
    Swal.fire("Not Found", "That fruit could not be found.", "error");
    console.log(error);
  }
}

function makeFruitChart(fruitData) {
  const chartCanvas = document.getElementById("fruitChart");

  if (fruitChart) {
    fruitChart.destroy();
  }

  fruitChart = new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels: ["Calories", "Sugar", "Carbs", "Protein", "Fat"],
      datasets: [
        {
          label: fruitData.name + " Nutrition",
          data: [
            fruitData.nutritions.calories,
            fruitData.nutritions.sugar,
            fruitData.nutritions.carbohydrates,
            fruitData.nutritions.protein,
            fruitData.nutritions.fat
          ]
        }
      ]
    }
  });
}

async function saveFruit() {
  if (currentFruit === null) {
    Swal.fire("Oops!", "Search for a fruit first.", "warning");
    return;
  }

  try {
    const response = await fetch("/api/saved-fruits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(currentFruit)
    });

    if (!response.ok) {
      throw new Error("Could not save fruit");
    }

    Swal.fire("Saved!", "Fruit saved successfully.", "success");

    loadSavedFruits();

  } catch (error) {
    Swal.fire("Error", "Could not save fruit.", "error");
    console.log(error);
  }
}

async function loadSavedFruits() {
  const tableBody = document.getElementById("savedFruitsBody");

  try {
    const response = await fetch("/api/saved-fruits");

    if (!response.ok) {
      throw new Error("Could not load saved fruits");
    }

    const savedFruits = await response.json();

    tableBody.innerHTML = "";

    savedFruits.forEach(function(fruit) {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${fruit.fruit_name}</td>
        <td>${fruit.calories}</td>
        <td>${fruit.sugar}</td>
        <td>${fruit.carbohydrates}</td>
      `;

      tableBody.appendChild(row);
    });

  } catch (error) {
    Swal.fire("Error", "Could not load saved fruits.", "error");
    console.log(error);
  }
}