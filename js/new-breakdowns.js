function setUpTeamBreakdowns() {
    if (TEAM_FIELDS.length < 2) {
        getTeamData();
    }

    graphContainer.style.display = 'none';
    pickListContainer.style.display = 'none';

    rawTable.innerHTML = '';

    let tableHeaderContainer = document.createElement('div');
    tableHeaderContainer.id = 'table-header-container';
    tableHeaderContainer.innerHTML = `<label for='breakdown-team-select' style='margin-right: 3vh'>Team:</label><select id='breakdown-team-select'></select>  <label for='breakdown-secondary-team-select' style='margin-right: 3vh; margin-left: 10vw;'>Compare with:</label><select id='breakdown-secondary-team-select'></select>`;
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

    breakdownTeamSelect.addEventListener('change', function (e) {
        runTeamBreakdown(this.value);
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

    let videoContainer = document.createElement('div');
    videoContainer.id = 'breakdown-video-container';
    breakdownContainer.appendChild(videoContainer);

    runTeamBreakdown(breakdownTeamSelect.value);
}

var currentMatchVideos = [];

function runTeamBreakdown(team) {

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
                    tempContainer.innerHTML = `<iframe width="100%" height="90%" allowfullscreen
                    src="https://www.youtube.com/embed/${json[i].videos[0].key}">
                    </iframe>`;
                    currentMatchVideos.push(tempContainer);
                    matches.push(json[i].match_number);
                }
            }
            let tempNewContainer = document.createElement('div');
            tempNewContainer.appendChild(tempLabel);
            tempNewContainer.appendChild(tempSelect);
            tempSelect.addEventListener('change', function() {
                document.getElementById('breakdown-video-container').removeChild(document.getElementById('breakdown-video-container').lastElementChild);
                document.getElementById('breakdown-video-container').appendChild(currentMatchVideos[this.value]);
            });
            container.appendChild(tempNewContainer);
            container.appendChild(currentMatchVideos[0]);
        });
}