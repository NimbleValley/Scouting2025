let breakdownGraphs = [];

function setUpTeamBreakdowns() {
    if (TEAM_FIELDS.length < 2) {
        getTeamData();
    }

    graphContainer.style.display = 'none';
    pickListContainer.style.display = 'none';

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
        temph4.innerText = breakdownCategories[i];

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

        let valueSelect = document.getElementById('breakdown-consistency-graph-select');
        let matches = [];
        let teamFields = [];
        let team = document.getElementById('breakdown-team-select').value;

        for (let i = 0; i < RECORDS.length; i++) {
            if (parseInt(RECORDS[i][0]) == parseInt(team) && !matches.includes(RECORDS[i][2])) {
                matches.push(parseInt(RECORDS[i][2]));
                teamFields.push(RECORDS[i][FIELDS.indexOf(TEAM_FIELDS[TEAM_FIELDS.indexOf(valueSelect.value)])]);
            }
        }

        breakdownGraphs[0] = showConsistencyLineGraph(document.getElementById('breakdown-consistency-graph-canvas'), matches, teamFields, [team]);
    });
    let consistencyCanvas = document.createElement('canvas');
    consistencyCanvas.id = 'breakdown-consistency-graph-canvas';
    for (let i = 0; i < consistencyCategories.length; i++) {
        let tempOption = document.createElement('option');
        tempOption.value = consistencyCategories[i];
        tempOption.innerText = consistencyCategories[i];
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

    let estimatedTimesContainer = document.createElement('div');
    estimatedTimesContainer.id = 'estimated-times-container';
    estimatedTimesContainer.innerHTML = `<div id='estimated-algae-time-container'>0s</div> <div id='estimated-coral-time-container'>0s</div>`;

    teamInformationContainer.appendChild(autoPlacementChartContainer);
    teamInformationContainer.appendChild(telePlacementChartContainer);
    teamInformationContainer.appendChild(subjectiveRanksContainer);
    teamInformationContainer.appendChild(estimatedTimesContainer);

    secondContainer.appendChild(videoGraphContainer);
    secondContainer.appendChild(teamInformationContainer);

    breakdownContainer.appendChild(secondContainer);

    if (TEAMS.length < 2) {
        getTeamData();
    }

    runTeamBreakdown(breakdownTeamSelect.value);
}

var currentMatchVideos = [];

function runTeamBreakdown(team) {

    let estimatedCycleTimes = estimateCycleTimes(team);

    localStorage.setItem('breakdown-team', team);

    /*let matchTeamTableSelect = document.getElementById('match-team-table-select');
    matchTeamTableSelect.innerHTML = '';
    for(let i = 0; i < TEAM_MATCHES[TEAMS.indexOf(parseInt(team))].length; i ++) {
        let tempOption = document.createElement('option');
        tempOption.value = TEAM_MATCHES[TEAMS.indexOf(parseInt(team))][i][2];
        tempOption.innerText = TEAM_MATCHES[TEAMS.indexOf(parseInt(team))][i][2];
        matchTeamTableSelect.appendChild(tempOption);
    }*/

    console.warn(breakdownGraphs.length);
    for (let i = 0; i < breakdownGraphs.length; i++) {
        breakdownGraphs[i].destroy();
    }
    breakdownGraphs = [];

    currentMatchVideos = []

    for (let i = 0; i < breakdownCategories.length; i++) {

        let teamsSorted = [];
        for (let t = 0; t < getSortedIndex(TEAM_FIELDS.indexOf(breakdownCategories[i]), TEAM_ROWS, TEAM_COLUMNS).length; t++) {
            // Adds the orders to array
            teamsSorted[t] = getSortedIndex(TEAM_FIELDS.indexOf(breakdownCategories[i]), TEAM_ROWS, TEAM_COLUMNS)[t][0];
        }

        // Sort the column, return the index that was matched up with the data
        // Decimal 0-1, 1 being they had the highest, 0 the lowest
        let score = teamsSorted.indexOf(parseInt(team)) / parseFloat(TEAMS.length - 1);

        document.getElementsByClassName('inner-breakdown-line')[i].style.height = `${score * 100}% `;
        document.getElementsByClassName('breakdown-popup')[i].innerText = `${(score * (TEAMS.length - 1)) + 1} out of ${TEAMS.length} `;
    }

    let videoContainer = document.getElementById('breakdown-video-container');
    videoContainer.innerHTML = '';

    getTeamMatchesTBA(`https://www.thebluealliance.com/api/v3/team/frc${team}/event/2023mndu/matches`, videoContainer);




    let valueSelect = document.getElementById('breakdown-consistency-graph-select');
    let matches = [];
    let teamFields = [];

    for (let i = 0; i < RECORDS.length; i++) {
        if (parseInt(RECORDS[i][0]) == parseInt(team) && !matches.includes(RECORDS[i][2])) {
            matches.push(parseInt(RECORDS[i][2]));
            teamFields.push(RECORDS[i][FIELDS.indexOf(TEAM_FIELDS[TEAM_FIELDS.indexOf(valueSelect.value)])]);
        }
    }

    let tempConsistencyGraph = showConsistencyLineGraph(document.getElementById('breakdown-consistency-graph-canvas'), matches, teamFields, [team]);
    breakdownGraphs.push(tempConsistencyGraph);

    let totalAutoPieces = 0;
    let totalAutoLevels = [0, 0, 0, 0];
    let totalTelePieces = 0;
    let totalTeleLevels = [0, 0, 0, 0];
    for (let i = 0; i < RECORDS.length; i++) {
        if (RECORDS[i][TEAM_INDEX] == team) {
            totalAutoPieces += RECORDS[i][FIELDS.indexOf('Auto Coral')];
            totalAutoPieces += RECORDS[i][FIELDS.indexOf('Tele Coral')];

            totalTelePieces += RECORDS[i][FIELDS.indexOf('Auto Coral')];
            totalTelePieces += RECORDS[i][FIELDS.indexOf('Tele Coral')];

            totalAutoLevels[0] += RECORDS[i][FIELDS.indexOf('Auto L1')];
            totalAutoLevels[1] += RECORDS[i][FIELDS.indexOf('Auto L2')];
            totalAutoLevels[2] += RECORDS[i][FIELDS.indexOf('Auto L3')];
            totalAutoLevels[3] += RECORDS[i][FIELDS.indexOf('Auto L4')];

            totalTeleLevels[0] += RECORDS[i][FIELDS.indexOf('Tele L1')];
            totalTeleLevels[1] += RECORDS[i][FIELDS.indexOf('Tele L2')];
            totalTeleLevels[2] += RECORDS[i][FIELDS.indexOf('Tele L3')];
            totalTeleLevels[3] += RECORDS[i][FIELDS.indexOf('Tele L4')];
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

    let teamRow = TEAM_ROWS[TEAMS.indexOf(parseInt(team))];
    document.getElementById('new-breakdown-scouter-rating').innerText = `${Math.round(teamRow[TEAM_FIELDS.indexOf('Pick Rating')]/2*1000)/10}`;
    document.getElementById('new-breakdown-driver-rating').innerText = `${Math.round((teamRow[TEAM_FIELDS.indexOf('Driver Rating')]-1)/4*1000)/10}`;
    document.getElementById('new-breakdown-speed-rating').innerText = `${ Math.round((teamRow[TEAM_FIELDS.indexOf('Cycle Rating')] + teamRow[TEAM_FIELDS.indexOf('Intake Rating')] - 2)/4*1000)/10 }`;

    document.getElementById('estimated-algae-time-container').innerHTML = `<div style='display: flex; flex-direction: column;'>Estimated Algae Time: <span class='estimation-time'>${Math.round(estimatedCycleTimes[0]*10)/10}s</span></div>`;
    document.getElementById('estimated-coral-time-container').innerHTML = `<div style='display: flex; flex-direction: column;'>Estimated Coral Time: <span class='estimation-time'>${Math.round(estimatedCycleTimes[1]*10)/10}s</span></div>`;
}




function getTeamMatchTable(team, tableType, stat) {

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