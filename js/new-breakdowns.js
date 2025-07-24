let breakdownGraphs = [];

function setUpTeamBreakdowns() {

    graphContainer.style.display = 'none';

    rawTable.innerHTML = '';

    let tableHeaderContainer = document.createElement('div');
    tableHeaderContainer.id = 'table-header-container';
    tableHeaderContainer.innerHTML = `<label for='breakdown-team-select' style='margin-right: 3vh'>Team:</label><select id='breakdown-team-select'></select>  <label for='breakdown-secondary-team-select' style='margin-right: 3vh; margin-left: 10vw;'>Compare with:</label><select id='breakdown-secondary-team-select'><option value='-'>-Select-</option></select><button id='new-breakdown-compare-button'>Go</button>`;
    rawTable.appendChild(tableHeaderContainer);

    let breakdownContainer = document.createElement('div');
    breakdownContainer.id = 'breakdown-container';
    rawTable.appendChild(breakdownContainer);

    let breakdownTeamSelect = document.getElementById('breakdown-team-select');

    for (let i = 0; i < TEAMS.length; i++) {
        let tempOption = document.createElement('option');
        tempOption.value = TEAMS[i];
        tempOption.innerText = TEAMS[i];
        breakdownTeamSelect.appendChild(tempOption);
    }

    // If there was a previously selected team select them
    if (localStorage.getItem('breakdown-team') != null && TEAMS.includes(parseInt(localStorage.getItem('breakdown-team')))) {
        breakdownTeamSelect.value = localStorage.getItem('breakdown-team');
    }

    breakdownTeamSelect.addEventListener('change', function (e) {
        runTeamBreakdown(this.value);
    });



    // SECONDARY TEAM
    let breakdownSecondaryTeamSelect = document.getElementById('breakdown-secondary-team-select');

    for (let i = 0; i < TEAMS.length; i++) {
        let tempOption = document.createElement('option');
        tempOption.value = TEAMS[i];
        tempOption.innerText = TEAMS[i];
        breakdownSecondaryTeamSelect.appendChild(tempOption);
    }

    breakdownSecondaryTeamSelect.addEventListener('change', function (e) {
        localStorage.setItem(`compare-team-0`, document.getElementById('breakdown-team-select').value);
        localStorage.setItem(`compare-team-1`, document.getElementById('breakdown-secondary-team-select').value);
    });

    document.getElementById('new-breakdown-compare-button').addEventListener('click', function () {
        if (document.getElementById('breakdown-secondary-team-select').value == '-') {
            alert('Select a team.');
            return;
        }
        removeActive();
        sideButtons[5].classList.add("active");
        setUpCompare();
    });

    let breakdownLines = document.createElement('div');
    breakdownLines.id = 'breakdown-lines-container';
    breakdownContainer.appendChild(breakdownLines);

    // Creates all breakdown line graph things
    for (let i = 0; i < breakdownCategories.length; i++) {

        // Parent Container for each line
        let tempContainer = document.createElement('div');
        tempContainer.className = 'line-container';

        // Line container
        let tempLine = document.createElement('div');
        tempLine.className = 'breakdown-line';

        // The thing that pops up when you hover over the line 
        let tempPopup = document.createElement('div');
        tempPopup.className = 'breakdown-popup';
        tempContainer.appendChild(tempPopup);

        // Actual line element
        let tempInnerLine = document.createElement('div');
        tempInnerLine.className = 'inner-breakdown-line';
        tempInnerLine.style.height = `0 % `;

        // Label for 
        let temph4 = document.createElement('h4');
        temph4.innerText = camelCaseToWords(breakdownCategories[i]);

        // Add them all to the correct container/s
        tempLine.appendChild(tempInnerLine);
        tempContainer.appendChild(tempLine);
        tempContainer.appendChild(temph4);
        breakdownLines.appendChild(tempContainer);
    }

    let secondContainer = document.createElement('div');
    secondContainer.id = 'breakdown-second-container'

    let videoGraphContainer = document.createElement('div');
    videoGraphContainer.id = 'video-graph-container';

    let videoContainer = document.createElement('div');
    videoContainer.id = 'breakdown-video-container';





    let matchTablesContainer = document.createElement('div');
    matchTablesContainer.id = 'breakdown-match-table-container';
    let matchTableSelect = document.createElement('select');
    matchTableSelect.innerHTML = `<option value='worst'>Worst Match</option><option value='median'>Median Match</option><option value='best'>Best Match</option>`;
    let matchTableTeamSelect = document.createElement('select');
    matchTableTeamSelect.id = 'match-team-table-select';
    matchTableSelect.addEventListener('change', function () {
        getTeamMatchTable(document.getElementById('breakdown-team-select'), this.value, 'Tele Points');
    });
    let matchTableHeader = document.createElement('div');
    matchTableHeader.appendChild(matchTableSelect);
    matchTableHeader.appendChild(matchTableTeamSelect);
    matchTablesContainer.appendChild(matchTableHeader);




    let consistencyContainer = document.createElement('div');
    consistencyContainer.id = 'breakdown-consistency-graph-container';
    let consistencySelect = document.createElement('select');
    consistencySelect.id = 'breakdown-consistency-graph-select';
    consistencySelect.addEventListener('change', function () {
        breakdownGraphs[0].destroy();

        let team = document.getElementById('breakdown-team-select').value;
        let valueSelect = document.getElementById('breakdown-consistency-graph-select');
        let matches = TEAM_RECORDS[TEAMS.indexOf(parseInt(team))].match;
        let teamFields = [];

        for (let i = 0; i < RAW_ROWS.length; i++) {
            if (parseInt(RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('teamNumber')]) == parseInt(team)) {
                teamFields.push(RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf(valueSelect.value)]);
            }
        }

        breakdownGraphs[0] = showConsistencyLineGraph(document.getElementById('breakdown-consistency-graph-canvas'), matches, teamFields, [team]);
    });
    let consistencyCanvas = document.createElement('canvas');
    consistencyCanvas.id = 'breakdown-consistency-graph-canvas';
    for (let i = 0; i < consistencyCategories.length; i++) {
        let tempOption = document.createElement('option');
        tempOption.value = consistencyCategories[i];
        tempOption.innerText = camelCaseToWords(consistencyCategories[i]);
        consistencySelect.appendChild(tempOption);
    }

    consistencyContainer.appendChild(consistencySelect);
    consistencyContainer.appendChild(consistencyCanvas);
    videoGraphContainer.appendChild(videoContainer);
    //videoGraphContainer.appendChild(matchTablesContainer);
    videoGraphContainer.appendChild(consistencyContainer);


    let teamInformationContainer = document.createElement('div');
    teamInformationContainer.id = 'breakdown-team-information-container';

    let autoPlacementChartContainer = document.createElement('div');
    autoPlacementChartContainer.className = 'placement-level-chart-canvas-container';

    let autoPlacementLevelChartCanvas = document.createElement('canvas');
    autoPlacementLevelChartCanvas.id = 'auto-placement-level-chart-canvas';
    autoPlacementLevelChartCanvas.className = 'placement-level-chart-canvas';

    let telePlacementChartContainer = document.createElement('div');
    telePlacementChartContainer.className = 'placement-level-chart-canvas-container';

    let telePlacementLevelChartCanvas = document.createElement('canvas');
    telePlacementLevelChartCanvas.id = 'tele-placement-level-chart-canvas';
    telePlacementLevelChartCanvas.className = 'placement-level-chart-canvas';

    autoPlacementChartContainer.appendChild(autoPlacementLevelChartCanvas);
    telePlacementChartContainer.appendChild(telePlacementLevelChartCanvas);

    let subjectiveRanksContainer = document.createElement('div');
    subjectiveRanksContainer.id = 'subjective-ranks-container';
    subjectiveRanksContainer.innerHTML = `
    <div class='breakdown-subjective-category-container'>

    <h3>Composite rating:</h3>

    <h2 id='new-breakdown-composite-rating'>:)</h2>

    </div>
    <div class='breakdown-subjective-category-container'>

    <h3 >Scouter rating:</h3>

    <h2 id='new-breakdown-scouter-rating'>92</h2>

    </div>

    <div class='breakdown-subjective-category-container'>

    <h3>Driver rating:</h3>

    <h2 id='new-breakdown-driver-rating'>92</h2>

    </div>
    <div class='breakdown-subjective-category-container'>

    <h3 >Speed rating:</h3>

    <h2 id='new-breakdown-speed-rating'>92</h2>

    </div>
    
    `;

    let statsCommentsContainer = document.createElement('div');
    statsCommentsContainer.id = 'new-breakdown-stat-comment-container';
    statsCommentsContainer.innerHTML = `<div id='new-breakdown-stats-container'></div><div id='new-breakdown-comments-container'></div><div id='new-breakdown-pit-scout-container'></div>`;

    let teamImage = document.createElement('img');
    teamImage.id = 'new-breakdown-team-image';

    let estimatedTimesContainer = document.createElement('div');
    estimatedTimesContainer.id = 'estimated-times-container';
    estimatedTimesContainer.innerHTML = `<div id='estimated-algae-time-container'>0s</div> <div id='estimated-coral-time-container'>0s</div>`;

    teamInformationContainer.appendChild(autoPlacementChartContainer);
    teamInformationContainer.appendChild(telePlacementChartContainer);
    teamInformationContainer.appendChild(subjectiveRanksContainer);
    teamInformationContainer.appendChild(estimatedTimesContainer);

    secondContainer.appendChild(videoGraphContainer);
    secondContainer.appendChild(teamInformationContainer);

    let dataTableContainer = document.createElement('div');
    dataTableContainer.id = 'new-breakdown-data-container';
    dataTableContainer.innerHTML = '<div id="new-breakdown-data-top"></div><div id="new-breakdown-data-bottom"></div>'

    breakdownContainer.appendChild(dataTableContainer);
    breakdownContainer.appendChild(secondContainer);
    breakdownContainer.appendChild(statsCommentsContainer);
    breakdownContainer.appendChild(teamImage);

    if (TEAMS.length < 2) {
        getTeamData();
    }

    runTeamBreakdown(breakdownTeamSelect.value);
}

var currentMatchVideos = [];

function runTeamBreakdown(team) {

    let dataType = 'mean';

    //let estimatedCycleTimes = estimateCycleTimes(team);
    let estimatedCycleTimes = [0, 0];

    localStorage.setItem('breakdown-team', team);

    /*let matchTeamTableSelect = document.getElementById('match-team-table-select');
    matchTeamTableSelect.innerHTML = '';
    for(let i = 0; i < TEAM_MATCHES[TEAMS.indexOf(parseInt(team))].length; i ++) {
        let tempOption = document.createElement('option');
        tempOption.value = TEAM_MATCHES[TEAMS.indexOf(parseInt(team))][i][2];
        tempOption.innerText = TEAM_MATCHES[TEAMS.indexOf(parseInt(team))][i][2];
        matchTeamTableSelect.appendChild(tempOption);
    }*/

    for (let i = 0; i < breakdownGraphs.length; i++) {
        breakdownGraphs[i].destroy();
    }
    breakdownGraphs = [];

    currentMatchVideos = []

    for (let i = 0; i < breakdownCategories.length; i++) {

        let teamsSorted = [];
        for (let t = 0; t < getSortedIndex(TEAM_FIELDS_ORDER.indexOf(breakdownCategories[i]), TEAM_ROWS[dataType], TEAM_COLUMNS[dataType]).length; t++) {
            // Adds the orders to array
            teamsSorted[t] = getSortedIndex(TEAM_FIELDS_ORDER.indexOf(breakdownCategories[i]), TEAM_ROWS[dataType], TEAM_COLUMNS[dataType])[t][0];
        }

        // Sort the column, return the index that was matched up with the data
        // Decimal 0-1, 1 being they had the highest, 0 the lowest
        let score = teamsSorted.indexOf(parseInt(team)) / parseFloat(TEAMS.length - 1);

        document.getElementsByClassName('inner-breakdown-line')[i].style.height = `${score * 100}% `;
        document.getElementsByClassName('breakdown-popup')[i].innerText = `${(score * (TEAMS.length - 1)) + 1} out of ${TEAMS.length} `;
    }

    let videoContainer = document.getElementById('breakdown-video-container');
    videoContainer.innerHTML = '';

    getTeamMatchesTBA(`https://www.thebluealliance.com/api/v3/team/frc${team}/event/2025hop/matches`, videoContainer);




    let valueSelect = document.getElementById('breakdown-consistency-graph-select');
    let matches = TEAM_RECORDS[TEAMS.indexOf(parseInt(team))].match;
    let teamFields = [];

    console.log(matches)

    let tempCommentContainer = document.getElementById('new-breakdown-comments-container');
    tempCommentContainer.innerHTML = '';

    for (let i = 0; i < RAW_ROWS.length; i++) {
        if (parseInt(RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('teamNumber')]) == parseInt(team)) {
            teamFields.push(RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf(valueSelect.value)]);

            let tempComment = document.createElement('h2');
            tempComment.className = 'new-breakdown-comment';
            tempComment.innerHTML = `<strong style='color: orange'>Match ${RECORDS[i].matchNumber}:</strong> ${RECORDS[i].commentText}`;
            tempCommentContainer.appendChild(tempComment);
        }
    }

    let tempConsistencyGraph = showConsistencyLineGraph(document.getElementById('breakdown-consistency-graph-canvas'), matches, teamFields, [team]);
    breakdownGraphs.push(tempConsistencyGraph);

    let totalAutoPieces = 0;
    let totalAutoLevels = [0, 0, 0, 0];
    let totalTelePieces = 0;
    let totalTeleLevels = [0, 0, 0, 0];
    for (let i = 0; i < RAW_ROWS.length; i++) {
        if (RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('teamNumber')] == team) {
            totalAutoPieces += RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('autoCoral')];
            totalAutoPieces += RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('teleCoral')];

            totalTelePieces += RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('autoCoral')];
            totalTelePieces += RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('teleCoral')];

            totalAutoLevels[0] += RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('autoL1Count')];
            totalAutoLevels[1] += RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('autoL2Count')];
            totalAutoLevels[2] += RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('autoL3Count')];
            totalAutoLevels[3] += RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('autoL4Count')];

            totalTeleLevels[0] += RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('teleL1Count')];
            totalTeleLevels[1] += RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('teleL2Count')];
            totalTeleLevels[2] += RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('teleL3Count')];
            totalTeleLevels[3] += RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('teleL4Count')];
        }
    }

    let autoLabels = ['L1', 'L2', 'L3', 'L4'];
    let teleLabels = ['L1', 'L2', 'L3', 'L4'];

    for (let i = 0; i < totalAutoLevels.length; i++) {
        if (totalAutoLevels[i] == 0) {
            totalAutoLevels.splice(i, 1);
            autoLabels.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < totalTeleLevels.length; i++) {
        if (totalTeleLevels[i] == 0) {
            totalTeleLevels.splice(i, 1);
            teleLabels.splice(i, 1);
            i--;
        }
    }

    let tempAutoPieGraph = showPieGraph(document.getElementById('auto-placement-level-chart-canvas'), totalAutoLevels, autoLabels, 'Auto Corals');
    breakdownGraphs.push(tempAutoPieGraph);

    let tempTelePieGraph = showPieGraph(document.getElementById('tele-placement-level-chart-canvas'), totalTeleLevels, teleLabels, 'Tele Corals');
    breakdownGraphs.push(tempTelePieGraph);

    let teamRow = TEAM_ROWS[dataType][TEAMS.indexOf(parseInt(team))];
    document.getElementById('new-breakdown-scouter-rating').innerText = `;)`;
    document.getElementById('new-breakdown-driver-rating').innerText = `${Math.round((teamRow[TEAM_FIELDS_ORDER.indexOf('driverSkill')] - 1) / 4 * 1000) / 10}`;
    document.getElementById('new-breakdown-speed-rating').innerText = `;)`;

    document.getElementById('estimated-algae-time-container').innerHTML = `<div style='display: flex; flex-direction: column;'>Estimated Algae Time: <span class='estimation-time'>idk</span></div>`;
    document.getElementById('estimated-coral-time-container').innerHTML = `<div style='display: flex; flex-direction: column;'>Estimated Coral Time: <span class='estimation-time'>idk</span></div>`;

    let teamImage = document.getElementById('new-breakdown-team-image');
    teamImage.src = '';
    for (let i = 0; i < TEAM_IMAGES.length; i++) {
        if (parseInt(team) == parseInt(TEAM_IMAGES[i].teamNumber)) {
            teamImage.src = TEAM_IMAGES[i].url;
            break;
        }
    }

    let pitScoutContainer = document.getElementById('new-breakdown-pit-scout-container');
    pitScoutContainer.innerHTML = '';
    for (let i = 0; i < TEAM_PIT_SCOUT.length; i++) {
        if (parseInt(team) == parseInt(TEAM_PIT_SCOUT[i].teamNumber)) {
            pitScoutContainer.innerHTML = 
            `
            <h2 class="new-breakdown-comment"><strong style="color: orange">Drivers: </strong>${TEAM_PIT_SCOUT[i].driverExperience}</h2>
            <h2 class="new-breakdown-comment"><strong style="color: orange">Climb: </strong>${TEAM_PIT_SCOUT[i].climbDetails}</h2>
            <h2 class="new-breakdown-comment"><strong style="color: orange">Changes: </strong>${TEAM_PIT_SCOUT[i].recentChanges}</h2>
            <h2 class="new-breakdown-comment"><strong style="color: orange">Algae: </strong>${TEAM_PIT_SCOUT[i].algaeDetails}</h2>
            `
            break;
        }
    }

    showNewBreakdownDataTable(team);
}

function showNewBreakdownDataTable(team) {
    let dataTable = document.getElementById('new-breakdown-data-top');

    dataTable.innerHTML = '';

    // Create the column headers
    for (let h = 1; h < RAW_FIELDS_ORDER.length; h++) {
        // Temp column
        let col = document.createElement('div');
        // Temp header
        let tempHeader = document.createElement('div');

        // Temp header text
        let tempHeaderText = document.createElement('h3');
        tempHeaderText.innerText = camelCaseToWords(RAW_FIELDS_ORDER[h]);
        tempHeader.appendChild(tempHeaderText);
        tempHeader.className = 'table-header-new-breakdown';
        tempHeader.style.top = '0vh';

        // Sets data type to first character in the first row of desired column,
        // used to see if data can be sorted numerically 
        let dataType = 1;
        if (RAW_ROWS.length > 0) {
            dataType = new String(RAW_ROWS[0][h]).substring(0, 1);
        }
        // Stores the data type as the header id 
        tempHeader.dataset.dataType = dataType;
        // Adds column number to header class list
        tempHeader.classList.add(`${(h)}`);
        // FIXME Sorts the column, passes column number, if it's numerical (NOPE), records, columns, fields, isTeam idk what else
        //tempHeader.onclick = function () { sortRawColumn(this.classList[1], RAW_ROWS, RAW_COLUMNS, RAW_FIELDS_ORDER) };

        col.className = 'column';
        col.appendChild(tempHeader);
        dataTable.appendChild(col);
    }

    let counter = 0;

    for (let i = 0; i < RAW_ROWS.length; i++) {
        if (parseInt(RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('teamNumber')]) != parseInt(team))
            continue;
        ++counter;
        for (let s = 1; s < RAW_FIELDS_ORDER.length; s++) {

            // Temp data value html element
            let tempDataValue = document.createElement("div");
            tempDataValue.className = "new-breakdown-data-value";
            tempDataValue.id = i;
            // Adds the nice norizontal stripes, easier to read
            if (counter % 3 == 0) {
                tempDataValue.style.backgroundColor = "#696866";
            }

            // Special cases where clicking does another behavior, such as opening comments section
            if (RAW_FIELDS_ORDER[s].includes("comment") || RAW_FIELDS_ORDER[s].includes("human")) {
                tempDataValue.innerText = "{ View }";
                tempDataValue.id = i;
                tempDataValue.classList.add(s);
                tempDataValue.onclick = function () { showCommentModal(RAW_ROWS[this.id][this.classList[1]]) }
                tempDataValue.addEventListener("click", function () {
                    setRowHighlight(this.id, true);
                });
            } else {
                // Otherwise highlight the correct row
                tempDataValue.innerText = RAW_ROWS[i][s];
                // id is the row the cell is in
                tempDataValue.addEventListener("click", function () {
                    //setRowHighlight(this.id, false);
                });
            }
            dataTable.children[s - 1].appendChild(tempDataValue);
        }
    }






    // Totals
    let totalTable = document.getElementById('new-breakdown-data-bottom');
    totalTable.innerHTML = '';

    let oldCols = dataTable.children;

    for (let h = 1; h < RAW_FIELDS_ORDER.length; h++) {
        // Temp column
        let col = document.createElement('div');
        col.className = 'column';
        col.style.minWidth = `${oldCols[h - 1].getBoundingClientRect().width}px`;
        col.style.width = `${oldCols[h - 1].getBoundingClientRect().width}px`;
        totalTable.appendChild(col);
    }

    for (let s = 1; s < RAW_FIELDS_ORDER.length; s++) {

        // Temp data value html element
        let tempDataValue = document.createElement("div");
        tempDataValue.className = "new-breakdown-data-value";

        // Special cases where clicking does another behavior, such as opening comments section
        if (!TEAM_FIELDS_ORDER.includes(RAW_FIELDS_ORDER[s])) {
            tempDataValue.innerText = "N/A";
            tempDataValue.classList.add(s);
        } else {
            // Otherwise highlight the correct row
            tempDataValue.innerText = TEAM_ROWS['mean'][TEAMS.indexOf(parseInt(team))][TEAM_FIELDS_ORDER.indexOf(RAW_FIELDS_ORDER[s])];
            // id is the row the cell is in
            tempDataValue.addEventListener("click", function () {
                //setRowHighlight(this.id, false);
            });
        }
        totalTable.children[s - 1].appendChild(tempDataValue);
    }
}





function getTeamMatchesTBA(url, container) {
    fetch(url, tbaOptions)
        .then((response) => response.json())
        .then((json) => {
            let matches = [];
            let tempSelect = document.createElement('select');
            tempSelect.id = 'breakdown-match-video-select';
            let tempLabel = document.createElement('label');
            tempLabel.innerText = 'Match:';
            tempLabel.for = 'breakdown-match-video-select';
            for (let i = 0; i < json.length; i++) {
                if (json[i].videos.length > 0) {
                    let tempOption = document.createElement('option');
                    tempOption.value = i;
                    tempOption.innerText = json[i].match_number;
                    tempSelect.appendChild(tempOption);

                    let tempContainer = document.createElement('div');
                    tempContainer.className = 'breakdown-video-container';
                    tempContainer.innerHTML = `<iframe width='100%' height='90%' allowfullscreen
                    src='https://www.youtube.com/embed/${json[i].videos[0].key}'>
                    </iframe>`;
                    currentMatchVideos.push(tempContainer);
                    matches.push(json[i].match_number);
                }
            }
            let tempNewContainer = document.createElement('div');
            tempNewContainer.appendChild(tempLabel);
            tempNewContainer.appendChild(tempSelect);
            tempSelect.addEventListener('change', function () {
                document.getElementById('breakdown-video-container').removeChild(document.getElementById('breakdown-video-container').lastElementChild);
                document.getElementById('breakdown-video-container').appendChild(currentMatchVideos[this.value]);
            });
            container.appendChild(tempNewContainer);
            if (currentMatchVideos.length > 0)
                container.appendChild(currentMatchVideos[0]);
        });
}
