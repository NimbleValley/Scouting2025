function setUpMatches() {
    getTeamData();

    rawTable.innerHTML = "";
    graphContainer.style.display = "none";
    pickListContainer.style.display = "none";
    breakdownGrid.style.display = "none";

    let matchSelect = document.createElement("select");

    let matches = [];
    matchSelect.id = "match-select";
    matchSelect.addEventListener("change", doMatch);

    for (var i = 0; i < TEAM_MATCH_DATA.length; i++) {
        let tempOption = document.createElement("option");
        tempOption.value = i;
        tempOption.text = TEAM_MATCH_DATA[i].Match;
        matchSelect.appendChild(tempOption);
    }

    if (localStorage.getItem("match-number") != null) {
        matchSelect.value = localStorage.getItem("match-number");
    }

    let field = document.createElement("div");
    field.id = "match-field";

    rawTable.appendChild(matchSelect);
    rawTable.appendChild(field);

    doMatch();
}

function doMatch() {
    let matchSelect = document.getElementById("match-select");

    localStorage.setItem("match-number", matchSelect.value);

    let matchNumber = parseInt(matchSelect.value);

    let matchField = document.getElementById("match-field");
    matchField.innerHTML = "";



    // BLUE SECTION
    let blueContainer = document.createElement("div");
    blueContainer.id = "blue-match-container";

    let blueColumns = [];

    for (let i = 0; i < 7; i++) {
        let tempColumn = document.createElement("div");
        tempColumn.className = "match-column"
        blueColumns.push(tempColumn);
        blueContainer.appendChild(tempColumn);
    }
    blueColumns[0].appendChild(createMatchCell(true, "Categories", true));
    for (let i = 0; i < 3; i++) {
        blueColumns[0].appendChild(createMatchCell(true, TEAM_MATCH_DATA[matchNumber].Blue[i], true));
    }
    blueColumns[0].appendChild(createMatchCell(true, "Totals", true));

    blueColumns[1].appendChild(createMatchCell(true, "AutoPoints", true));
    blueColumns[2].appendChild(createMatchCell(true, "TelePoints", true));
    blueColumns[3].appendChild(createMatchCell(true, "EndgamePoints", true));
    blueColumns[4].appendChild(createMatchCell(true, "TotalPoints", true));
    blueColumns[5].appendChild(createMatchCell(true, "Amps", true));
    blueColumns[6].appendChild(createMatchCell(true, "Gamepieces", true));

    let dataIndicies = [1, 2, 3, 4, 13, -1];
    let blueTotals = [];

    for (let i = 0; i < dataIndicies.length; i++) {
        blueTotals.push(0);
        for (let t = 0; t < 3; t++) {
            let tempValue = 0;
            if (dataIndicies[i] != -1) {
                tempValue = TEAM_COLUMNS[dataIndicies[i]][TEAMS.indexOf(parseInt(TEAM_MATCH_DATA[matchNumber].Blue[t]))];
            } else {
                tempValue = TEAM_COLUMNS[5][TEAMS.indexOf(parseInt(TEAM_MATCH_DATA[matchNumber].Blue[t]))] + TEAM_COLUMNS[8][TEAMS.indexOf(parseInt(TEAM_MATCH_DATA[matchNumber].Blue[t]))] + TEAM_COLUMNS[10][TEAMS.indexOf(parseInt(TEAM_MATCH_DATA[matchNumber].Blue[t]))] + TEAM_COLUMNS[13][TEAMS.indexOf(parseInt(TEAM_MATCH_DATA[matchNumber].Blue[t]))];
            }
            tempValue = Math.round(tempValue * 10) / 10;
            if (isNaN(tempValue)) {
                tempValue = 0;
            }
            blueTotals[i] += tempValue;
            blueColumns[i + 1].appendChild(createMatchCell(true, tempValue, false));
        }
    }

    for (let i = 0; i < blueTotals.length; i++) {
        blueColumns[i + 1].appendChild(createMatchCell(true, Math.round(blueTotals[i] * 10) / 10, true));
    }

    matchField.appendChild(blueContainer);



    // RED SECTION
    let redContainer = document.createElement("div");
    redContainer.id = "red-match-container";

    let redColumns = [];

    for (let i = 0; i < 7; i++) {
        let tempColumn = document.createElement("div");
        tempColumn.className = "match-column"
        redColumns.push(tempColumn);
        redContainer.appendChild(tempColumn);
    }
    redColumns[0].appendChild(createMatchCell(false, "Categories", true));
    for (let i = 0; i < 3; i++) {
        redColumns[0].appendChild(createMatchCell(false, TEAM_MATCH_DATA[matchNumber].Red[i], true));
    }
    redColumns[0].appendChild(createMatchCell(false, "Totals", true));

    redColumns[1].appendChild(createMatchCell(false, "AutoPoints", true));
    redColumns[2].appendChild(createMatchCell(false, "TelePoints", true));
    redColumns[3].appendChild(createMatchCell(false, "EndgamePoints", true));
    redColumns[4].appendChild(createMatchCell(false, "TotalPoints", true));
    redColumns[5].appendChild(createMatchCell(false, "Amps", true));
    redColumns[6].appendChild(createMatchCell(false, "Gamepieces", true));

    let redTotals = [];

    for (let i = 0; i < dataIndicies.length; i++) {
        redTotals.push(0);
        for (let t = 0; t < 3; t++) {
            let tempValue = 0;
            if (dataIndicies[i] != -1) {
                tempValue = TEAM_COLUMNS[dataIndicies[i]][TEAMS.indexOf(parseInt(TEAM_MATCH_DATA[matchNumber].Red[t]))];
            } else {
                tempValue = TEAM_COLUMNS[5][TEAMS.indexOf(parseInt(TEAM_MATCH_DATA[matchNumber].Red[t]))] + TEAM_COLUMNS[8][TEAMS.indexOf(parseInt(TEAM_MATCH_DATA[matchNumber].Red[t]))] + TEAM_COLUMNS[10][TEAMS.indexOf(parseInt(TEAM_MATCH_DATA[matchNumber].Red[t]))] + TEAM_COLUMNS[13][TEAMS.indexOf(parseInt(TEAM_MATCH_DATA[matchNumber].Red[t]))];
            }
            tempValue = Math.round(tempValue * 10) / 10;
            if (isNaN(tempValue)) {
                tempValue = 0;
            }
            redTotals[i] += tempValue;
            redColumns[i + 1].appendChild(createMatchCell(false, tempValue, false));
        }
    }

    for (let i = 0; i < redTotals.length; i++) {
        redColumns[i + 1].appendChild(createMatchCell(false, Math.round(redTotals[i] * 10) / 10, true));
    }

    matchField.appendChild(redContainer);
}

function createMatchCell(blue, text, bold) {
    let tempCell = document.createElement("div");
    tempCell.innerText = text;
    tempCell.className = "match-data-cell";
    if (bold) {
        tempCell.style.fontWeight = "bold";
    }
    if (blue) {
        tempCell.id = "blue-match-data-cell";
        return tempCell;
    }
    tempCell.id = "red-match-data-cell";
    return tempCell;
}