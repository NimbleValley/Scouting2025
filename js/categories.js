var categoryGraph;

function setUpCategories() {
    getTeamData();

    let categoryContainer = document.createElement("div");
    categoryContainer.id = "category-container";

    rawTable.innerHTML = "";

    let tempTeamSelect = document.createElement("select");
    tempTeamSelect.className = "compare-team-select";
    tempTeamSelect.id = "category-team-select";

    let anyOption = document.createElement("option");
    anyOption.value = "Any";
    anyOption.innerText = "Team?";
    tempTeamSelect.appendChild(anyOption);

    let tempSelectContainer = document.createElement("div");

    for (let t = 0; t < TEAMS.length; t++) {
        let tempOption = document.createElement("option");
        tempOption.value = String(TEAMS[t]);
        tempOption.innerText = TEAMS[t];
        tempTeamSelect.appendChild(tempOption);
    }
    tempTeamSelect.value = "Any";
    tempSelectContainer.appendChild(tempTeamSelect);

    tempSelectContainer.style.backgroundColor = '#313131';
    tempSelectContainer.style.paddingBottom = '3vh';
    tempSelectContainer.style.userSelect = 'none';



    let tempCategorySelect = document.createElement("select");
    tempCategorySelect.className = "compare-team-select";
    tempCategorySelect.id = "category-category-select";

    tempTeamSelect.addEventListener('change', runCategories);
    tempCategorySelect.addEventListener('change', runCategories);

    console.log(TEAM_FIELDS)

    for (let t = 1; t < TEAM_FIELDS.length; t++) {
        let tempOption = document.createElement("option");
        tempOption.value = String(t);
        tempOption.innerText = TEAM_FIELDS[t];
        tempCategorySelect.appendChild(tempOption);
    }
    tempSelectContainer.appendChild(tempCategorySelect);

    categoryContainer.appendChild(tempSelectContainer);
    //categoryContainer.style.backgroundColor = '#313131';
    rawTable.appendChild(categoryContainer);

    if (localStorage.getItem("category") != null) {
        tempCategorySelect.value = localStorage.getItem("category");
    }

    runCategories();
}

function runCategories() {
    if (categoryGraph != null) {
        categoryGraph.destroy();
    }

    let categoryContainer = document.getElementById("category-container");

    if (categoryContainer.children.length > 1) {
        for (let i = 0; i < 1; i++) {
            categoryContainer.removeChild(categoryContainer.lastChild);
        }
    }

    let columnNumber = parseInt(document.getElementById("category-category-select").value);

    localStorage.setItem("category", document.getElementById("category-category-select").value);

    let tempColumns = [];
    for (let i = 0; i < 3; i++) {
        let tempColumn = document.createElement("div");
        tempColumn.className = "column";
        tempColumn.style.marginLeft = "1.5vh";
        tempColumns.push(tempColumn);
    }

    let valuesSorted = JSON.parse(JSON.stringify(TEAM_COLUMNS[columnNumber]));
    valuesSorted = valuesSorted.sort(function (a, b) { return b - a });

    let teams = [];

    let tempTeamColumn = JSON.parse(JSON.stringify(TEAM_COLUMNS[columnNumber]));
    let tempTeams = JSON.parse(JSON.stringify(TEAMS));

    for (let i = 0; i < TEAMS.length; i++) {
        let index = tempTeamColumn.indexOf(valuesSorted[i]);
        teams.push(tempTeams[index]);

        tempTeamColumn.splice(index, 1);
        tempTeams.splice(index, 1);
    }

    let tableContainer = document.createElement("div");
    tableContainer.id = "category-table-container";

    for (let i = 0; i < TEAM_COLUMNS[columnNumber].length; i++) {
        let tempPlace = document.createElement("div");
        tempPlace.innerText = i + 1;
        tempPlace.className = "category-data-value";
        tempColumns[0].appendChild(tempPlace);

        let tempTeam = document.createElement("div");
        tempTeam.innerText = teams[i];
        tempTeam.className = "category-data-value";
        tempColumns[1].appendChild(tempTeam);

        let tempValue = document.createElement("div");
        tempValue.innerText = valuesSorted[i];
        tempValue.className = "category-data-value";
        tempColumns[2].appendChild(tempValue);

        tempPlace.style.backgroundColor = "#302f2b";
        if (i % 3 == 1) {
            tempTeam.style.backgroundColor = "#302f2b";
            tempValue.style.backgroundColor = "#302f2b";
        }
    }

    for (let c = 0; c < tempColumns.length; c++) {
        tableContainer.appendChild(tempColumns[c]);
    }

    let categoryCanvasContainer = document.createElement('div');
    categoryCanvasContainer.id = 'category-canvas-container';

    let compareCanvas = document.createElement('canvas');
    compareCanvas.height = '100%';
    categoryCanvasContainer.appendChild(compareCanvas);
    tableContainer.appendChild(categoryCanvasContainer);
    categoryGraph = showCompareBarGraph(compareCanvas, valuesSorted, teams, 'Bar');

    categoryContainer.appendChild(tableContainer);

    highlightCategory();
}

function highlightCategory() {
    let targetTeam = document.getElementById("category-team-select").value;

    if (targetTeam == "Any") {
        return;
    }
    targetTeam = parseInt(targetTeam);

    let columns = document.getElementsByClassName("column");
    console.log(columns[0]);

    for (let i = 0; i < columns[0].children.length; i++) {
        //console.log(columns[1][i]);
        if (parseInt(columns[1].children[i].innerText) == targetTeam) {
            columns[0].children[i].style.backgroundColor = "rgb(189, 95, 33)";
            columns[1].children[i].style.backgroundColor = "rgb(189, 95, 33)";
            columns[2].children[i].style.backgroundColor = "rgb(189, 95, 33)";
            columns[0].children[i].scrollIntoView();
            return;
        }
    }
}

function showCompareBarGraph(canvas, sortedGraphColumn, teamsSorted, description) {

    console.log("Rendering horizontal bar graph.");

    var data = [];

    for (let i = 0; i < sortedGraphColumn.length; i++) {
        data.push({ team: teamsSorted[i], count: sortedGraphColumn[i] })
    }

    console.log(data.length);

    const config = {
        type: 'bar',
        responsive: false,
        data: {
            labels: data.map(x => x.team),
            datasets: [
                {
                    label: description,
                    data: data.map(row => row.count),
                    backgroundColor: 'rgb(189, 95, 33)',
                    color: "#ffffff"
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    display:false,
                    ticks: {
                        display: false
                      }
                },
                y: {
                    display: false,
                    ticks: {
                        display: false
                      }
                }
            },
            plugins: {
                legend: {
                  display: false
                }
              }
            
        },
    };

    graph = new Chart(canvas, config);
    return graph;
}