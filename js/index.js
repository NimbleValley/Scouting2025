// TODO Everything haha 

console.log(math.sqrt(-4).toString());

// Default:
localStorage.setItem('team-table-type-select', 'median');

// Colors cool
if (localStorage.getItem('showTeamPercentileColor') == null) {
    localStorage.setItem('showTeamPercentileColor', 'Yes');
}

// Animation timeline
var tl = new TimelineMax();

// Sidebar variables, self explanatory
const sidebar = document.getElementById("sidebar");
var openSidebarButton = document.getElementById("open-sidebar");
var sidebarButtonContainer = document.getElementById("side-button-container");
window.addEventListener('resize', () => {
    if (window.innerHeight > window.innerWidth) {
        sidebar.innerHTML = `<div id="side-button-container">
        <div class="side-button" onclick="fetchData()">Refresh</div>
        <div class="side-button" onclick="showTeamData()">Tables</div>
        <!-- FIXME MIGHT HAVE TO CALL openTeamBreakdowns() twice for some reason, not sure why-->
        <div class="side-button" onclick="setUpRanks()">Ranks</div>
        <div class="side-button" onclick="setUpTeamBreakdowns();">Teams</div>
        <div class="side-button" onclick="setUpGraph()">Graph</div>
        <div class="side-button" onclick="setUpCompare()">Compare</div>
        <!--<div class="side-button" onclick="setUpMatches()">Matches</div>-->
        <div class="side-button" onclick="setUpSimulations()">Simulate</div>
        <!--<div class="side-button" onclick="setUpMatches()">Matches</div>-->
        <div class="side-button" onclick="setUpNewPickList()">Pick List</div>
        <div class="side-button" onclick="toggleSettings()">Settings</div>
    </div>
    <div id="open-sidebar" onclick="toggleSidebar()">
    ≡
    </div>`;
        openSidebarButton = document.getElementById("open-sidebar");
        sidebarButtonContainer = document.getElementById("side-button-container");
    } else {
        sidebar.innerHTML = `<div id="side-button-container">
        <div class="side-button" onclick="fetchData()">Refresh</div>
        <div class="side-button" onclick="showTeamData()">Tables</div>
        <!-- FIXME MIGHT HAVE TO CALL openTeamBreakdowns() twice for some reason, not sure why-->
        <div class="side-button" onclick="setUpRanks()">Ranks</div>
        <div class="side-button" onclick="setUpTeamBreakdowns();">Teams</div>
        <div class="side-button" onclick="setUpGraph()">Graph</div>
        <div class="side-button" onclick="setUpCompare()">Compare</div>
        <!--<div class="side-button" onclick="setUpMatches()">Matches</div>-->
        <div class="side-button" onclick="setUpSimulations()">Simulate</div>
        <!--<div class="side-button" onclick="setUpMatches()">Matches</div>-->
        <div class="side-button" onclick="setUpNewPickList()">Pick List</div>
        <div class="side-button" onclick="toggleSettings()">Settings</div>
    </div>
    <div id="open-sidebar" onclick="toggleSidebar()">
        <p>></p>
    </div>`;
        openSidebarButton = document.getElementById("open-sidebar");
        sidebarButtonContainer = document.getElementById("side-button-container");
        sidebar.style.left = '0';

    }
});
var sidebarOpen = true;


// Settings overlay
const settings = document.getElementById("settings");
var settingsOpen = false;
const eventSelect = document.getElementById("event-select");
// URL
const urlInput = document.getElementById("spreadsheet-url-input");
// Checks for previous url, if none has been saved, default to 2024 spreadsheet
if (localStorage.getItem("spreadsheet-url") == null || localStorage.getItem("spreadsheet-url") == "") {
    urlInput.value = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsDG3DqzC9lAUfmVWAbt3kxXpbH_LFrPA6NzRWrddU7xFr9FEb9TGAar-AoGdJ7FBjA8gDBm9MJoFb/pub?gid=0&single=true&output=csv";
} else {
    urlInput.value = localStorage.getItem("spreadsheet-url");
    urlInput.value = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsDG3DqzC9lAUfmVWAbt3kxXpbH_LFrPA6NzRWrddU7xFr9FEb9TGAar-AoGdJ7FBjA8gDBm9MJoFb/pub?gid=0&single=true&output=csv";
}

// FIXME important these match up, probably could improve

//const teamDataToKeep = ['Team Number', 'Total Points', 'Auto Points', 'Tele Points', 'Endgame Points', 'Auto L4', 'Auto L3', 'Auto L2', 'Auto L1', 'Auto Processor', 'Auto Net', 'Auto Algae Removed', 'Auto Miss', 'Auto Coral', 'Tele L4', 'Tele L3', 'Tele L2', 'Tele L1', 'Tele Processor', 'Tele Net', 'Tele Algae Removed', 'Tele Miss', 'Tele Coral', 'Total Net', 'Total Processor', 'Total Algae Removed', 'Total Coral', 'Driver Rating', 'Intake Rating', 'Cycle Rating', 'Pick Rating'];
const breakdownCategories = ['totalPoints', 'autoPoints', 'telePoints', 'endgamePoints', 'totalCoral', 'teleNetCount', 'totalAlgae', 'totalGamepieces'];
const consistencyCategories = ['totalPoints', 'autoPoints', 'telePoints', 'endgamePoints', 'totalCoral', 'teleNetCount', 'totalAlgae', 'totalGamepieces'];
const badCompareValues = ['autoMissNetCount', 'teleMissNetCount', 'autoMissCoralCount', 'teleMissCoralCount'];

// Graphing variables
const graphContainer = document.getElementById("graph-container");
var firstGraph = true;


// Modal for team comments
const commentModal = document.getElementById("comment-modal");
const closeCommentModal = document.getElementById("close-comment-modal");
var previousTeamComment = -1;


// Side button setup
const sideButtons = document.getElementsByClassName("side-button");
setUpSideButtonEvents();


var highlightTeamData = []


// HTML data table element, for raw and team data
const rawTable = document.getElementById("data-table");


// All data field names
var FIELDS = new Array();
// All data field keys
var KEYS = new Array();
// Records, arranged by object keys
var RECORDS = new Array();
// Records, arranged in rows
var RAW_ROWS = new Array();
// Records, arranged in columns
var RAW_COLUMNS = new Array();

// Records, arranged by team object keys
var TEAM_RECORDS = new Array();
// Data arranged by team, in rows
var TEAM_ROWS = new Array();
// Data arranged by team, in columns
var TEAM_COLUMNS = new Array();
// List of all teams
var TEAMS = new Array();

var TEAM_IMAGES = new Array();

var TEAM_PIT_SCOUT = new Array();

var TEAM_PERCENTILES = new Array();


const warningTypes = ["Too Tall/s", "Comm Issue/s", "Disabled", "Unintelligent", "Reckless"];

localStorage.setItem("previousHighlightRow", -1);

// TBA API constants, for finding events
var TBA_EVENT_KEYS;
var TBA_EVENT_NAMES = new Array();
var TBA_RECORDS;
var TBA_COLUMNS;
const tbaOptions = {
    headers: {
        'X-TBA-Auth-Key': 'sBluV8DKQA0hTvJ2ABC9U3VDZunUGUSehxuDPvtNC8SQ3Q5XHvQVt0nm3X7cvP7j'
    }
}
// Gets event list of current year
const Year = new Date().getFullYear();
getEventListTBA(`https://www.thebluealliance.com/api/v3/events/${Year}`);



// Sets up the buttons in side bar, callback
function setUpSideButtonEvents() {
    for (var i = 1; i < sideButtons.length - 1; i++) {
        sideButtons[i].addEventListener("click", function () {
            removeActive();
            // Gives orange highlight to correct side button
            this.classList.add("active");
        });
    }
}


// Removes orange highlight from side buttons
function removeActive() {

    for (let i = 0; i < sideButtons.length; i++) {
        sideButtons[i].classList = "side-button";
    }

    if (window.innerHeight > window.innerWidth) {
        toggleSidebar();
    }
}


// Initial data fetching
fetchData();

async function fetchData() {

    fetchTeamImages();
    fetchPitScoutData();

    try {
        const snapshot = await db.collection('scoutingForms').get();

        rawTable.innerHTML = '<h5>Fetching data...</h5>';

        removeActive();
        sideButtons[1].classList.add('active');

        TEAMS = [];

        RAW_ROWS = [];
        RAW_COLUMNS = [];

        TEAM_RECORDS = [];

        KEYS = Object.keys(snapshot.docs[0].data());
        FIELDS = Object.keys(snapshot.docs[0].data());

        for (let i = 0; i < FIELDS.length; i++) {
            FIELDS[i] = camelCaseToWords(FIELDS[i]);
        }

        // RECORDS, TEAMS, RAW_ROWS, & RAW_COLUMNS
        RECORDS = [];
        for (let i = 0; i < snapshot.docs.length; i++) {
            let tempData = snapshot.docs[i].data();

            RECORDS.push(tempData);

            if (!TEAMS.includes(parseInt(tempData.teamNumber)) && parseInt(tempData.teamNumber) != -1) {
                TEAMS.push(parseInt(tempData.teamNumber));
            }

            let keys = Object.keys(tempData);
            let currentRow = new Array(Object.keys(tempData).length);
            for (let c = 0; c < Object.keys(tempData).length; c++) {
                let organizedIndex = RAW_FIELDS_ORDER.indexOf(keys[c]);
                if (organizedIndex >= 0)
                    currentRow[organizedIndex] = tempData[keys[c]];
            }
            RAW_ROWS.push(currentRow);
        }

        TEAMS.sort(function (a, b) {
            return a - b;
        });

        RECORDS.sort((a, b) => a.teamNumber.localeCompare(b.teamNumber));

        RAW_COLUMNS = RAW_ROWS[0].map((_, colIndex) => RAW_ROWS.map(row => row[colIndex]));

        // TEAM_RECORDS, TEAM_ROWS, & TEAM_COLUMNS
        TEAMS.forEach(element => {
            console.log(element);
            TEAM_RECORDS.push({
                'teamNumber': parseInt(element),
                'mean': TEAM_FIELDS_ORDER.reduce((acc, currentKey) => { acc[currentKey] = new Array(); return acc; }, {}),
                'median': TEAM_FIELDS_ORDER.reduce((acc, currentKey) => { acc[currentKey] = new Array(); return acc; }, {}),
                'max': TEAM_FIELDS_ORDER.reduce((acc, currentKey) => { acc[currentKey] = new Array(); return acc; }, {}),
                'min': TEAM_FIELDS_ORDER.reduce((acc, currentKey) => { acc[currentKey] = new Array(); return acc; }, {}),
                'match': new Array(),
            });
        });

        // Start by adding all data values to mean, median, max, & min for each team
        for (let i = 0; i < snapshot.docs.length; i++) {
            let tempData = snapshot.docs[i].data();

            if (!TEAMS.includes(parseInt(tempData.teamNumber)))
                continue;

            let index = TEAMS.indexOf(parseInt(tempData.teamNumber));

            for (let c = 0; c < TEAM_FIELDS_ORDER.length; c++) {
                let currentKey = TEAM_FIELDS_ORDER[c];
                TEAM_RECORDS[index].mean[currentKey].push(parseInt(tempData[currentKey]));
                TEAM_RECORDS[index].median[currentKey].push(parseInt(tempData[currentKey]));
                TEAM_RECORDS[index].max[currentKey].push(parseInt(tempData[currentKey]));
                TEAM_RECORDS[index].min[currentKey].push(parseInt(tempData[currentKey]));
            }
            TEAM_RECORDS[index].match.push(tempData.matchNumber);
        }

        // Now we must loop through and find the means, medians, maxes, & mins for each team
        for (let i = 0; i < TEAM_RECORDS.length; i++) {

            for (let c = 0; c < TEAM_FIELDS_ORDER.length; c++) {
                let currentKey = TEAM_FIELDS_ORDER[c];
                TEAM_RECORDS[i].mean[currentKey] = Math.round(getMean(TEAM_RECORDS[i].mean[currentKey]) * 10) / 10;
                TEAM_RECORDS[i].median[currentKey] = Math.round(getMedian(TEAM_RECORDS[i].median[currentKey]) * 10) / 10;
                TEAM_RECORDS[i].max[currentKey] = Math.round(getMax(TEAM_RECORDS[i].max[currentKey]) * 10) / 10;
                TEAM_RECORDS[i].min[currentKey] = Math.round(getMin(TEAM_RECORDS[i].min[currentKey]) * 10) / 10;
            }

        }

        TEAM_ROWS = {
            'mean': new Array(TEAM_RECORDS.length),
            'median': new Array(TEAM_RECORDS.length),
            'max': new Array(TEAM_RECORDS.length),
            'min': new Array(TEAM_RECORDS.length)
        };

        for (let i = 0; i < TEAM_RECORDS.length; i++) {
            TEAM_ROWS.mean[i] = new Array(TEAM_FIELDS_ORDER.length);
            TEAM_ROWS.median[i] = new Array(TEAM_FIELDS_ORDER.length);
            TEAM_ROWS.max[i] = new Array(TEAM_FIELDS_ORDER.length);
            TEAM_ROWS.min[i] = new Array(TEAM_FIELDS_ORDER.length);

            for (let c = 0; c < TEAM_FIELDS_ORDER.length; c++) {
                let currentKey = TEAM_FIELDS_ORDER[c];
                TEAM_ROWS.mean[i][c] = TEAM_RECORDS[i].mean[currentKey];
                TEAM_ROWS.median[i][c] = TEAM_RECORDS[i].median[currentKey];
                TEAM_ROWS.max[i][c] = TEAM_RECORDS[i].max[currentKey];
                TEAM_ROWS.min[i][c] = TEAM_RECORDS[i].min[currentKey];
            }
        }

        TEAM_COLUMNS = {
            'mean': TEAM_ROWS.mean[0].map((_, colIndex) => TEAM_ROWS.mean.map(row => row[colIndex])),
            'median': TEAM_ROWS.median[0].map((_, colIndex) => TEAM_ROWS.median.map(row => row[colIndex])),
            'max': TEAM_ROWS.max[0].map((_, colIndex) => TEAM_ROWS.max.map(row => row[colIndex])),
            'min': TEAM_ROWS.min[0].map((_, colIndex) => TEAM_ROWS.min.map(row => row[colIndex]))
        };

        // Ok, now we figure out the percentiles for each team based on TEAM_PERCENTILE_FIELDS
        TEAM_PERCENTILES = {
            'mean': {
                '10': [],
                '25': [],
                '75': [],
                '90': [],
            },
            'median': {
                '10': [],
                '25': [],
                '75': [],
                '90': [],
            },
            'max': {
                '10': [],
                '25': [],
                '75': [],
                '90': [],
            },
            'min': {
                '10': [],
                '25': [],
                '75': [],
                '90': [],
            },
        }
        for (const key in TEAM_COLUMNS) {
            TEAM_PERCENTILES[key]['10'] = new Array(TEAM_PERCENTILE_FIELDS.length);
            TEAM_PERCENTILES[key]['25'] = new Array(TEAM_PERCENTILE_FIELDS.length);
            TEAM_PERCENTILES[key]['75'] = new Array(TEAM_PERCENTILE_FIELDS.length);
            TEAM_PERCENTILES[key]['90'] = new Array(TEAM_PERCENTILE_FIELDS.length);
            for (let c = 0; c < TEAM_COLUMNS[key].length; c++) {
                if (!TEAM_PERCENTILE_FIELDS.includes(TEAM_FIELDS_ORDER[c]))
                    continue;

                TEAM_PERCENTILES[key]['10'][TEAM_PERCENTILE_FIELDS.indexOf(TEAM_FIELDS_ORDER[c])] = (getPercentile(TEAM_COLUMNS[key][c], 10));
                TEAM_PERCENTILES[key]['25'][TEAM_PERCENTILE_FIELDS.indexOf(TEAM_FIELDS_ORDER[c])] = (getPercentile(TEAM_COLUMNS[key][c], 25));
                TEAM_PERCENTILES[key]['75'][TEAM_PERCENTILE_FIELDS.indexOf(TEAM_FIELDS_ORDER[c])] = (getPercentile(TEAM_COLUMNS[key][c], 75));
                TEAM_PERCENTILES[key]['90'][TEAM_PERCENTILE_FIELDS.indexOf(TEAM_FIELDS_ORDER[c])] = (getPercentile(TEAM_COLUMNS[key][c], 90));
            }
        }

        // Yay, everything is basically set up now! Time to render

        console.log(TEAM_PERCENTILES);

        showTeamData();

    } catch (error) {
        alert("Error fetching teams:", error);
        console.error("Error fetching teams:", error);
    }
}

async function fetchTeamImages() {
    try {
        const snapshot = await db.collection('robotImages').get();

        TEAM_IMAGES = new Array();

        for (let i = 0; i < snapshot.docs.length; i++) {
            let tempData = snapshot.docs[i].data();
            TEAM_IMAGES.push(tempData)
        }

        console.log(TEAM_IMAGES);

    } catch (error) {
        alert("Error fetching team images:", error);
        console.error("Error fetching team images:", error);
    }
}

async function fetchPitScoutData() {
    try {
        const snapshot = await db.collection('pitScout').get();

        TEAM_PIT_SCOUT = new Array();

        for (let i = 0; i < snapshot.docs.length; i++) {
            let tempData = snapshot.docs[i].data();
            TEAM_PIT_SCOUT.push(tempData)
        }

        console.log(TEAM_PIT_SCOUT);

    } catch (error) {
        alert("Error fetching pit scout data:", error);
        console.error("Error fetching pit scout data:", error);
    }
}

function showRawData() {
    rawTable.innerHTML = '';

    // Add select to navigate between raw/team data
    let tableHeaderContainer = document.createElement('div');
    tableHeaderContainer.id = 'table-header-container';
    tableHeaderContainer.innerHTML = `<select id='table-type-select' value='raw'><option value="team">Team Data</option><option value="raw" selected>Raw Data</option></select> <label for='raw-match-number-input' style='margin-left: 7vh;'>Jump to match:</label><input type='text' id='raw-match-number-input'>   <label for='specific-team-matches-select' style='margin-left: 7vh;'>Specific team:</label> <select id='specific-team-matches-select'><option value='-1'>ALL</option></select>`;
    rawTable.appendChild(tableHeaderContainer);

    document.getElementById('table-type-select').addEventListener('change', function (e) {
        if (document.getElementById('table-type-select').value == 'team') {
            showTeamData();
        }
    });

    // Create the column headers
    for (let h = 0; h < RAW_FIELDS_ORDER.length; h++) {
        // Temp column
        let col = document.createElement('div');
        // Temp header
        let tempHeader = document.createElement('div');

        // Temp header text
        let tempHeaderText = document.createElement('h3');
        tempHeaderText.innerText = camelCaseToWords(RAW_FIELDS_ORDER[h]);
        tempHeader.appendChild(tempHeaderText);
        tempHeader.className = 'table-header-section-raw';

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
        tempHeader.onclick = function () { sortRawColumn(this.classList[1], RAW_ROWS, RAW_COLUMNS, RAW_FIELDS_ORDER) };

        col.className = 'column';
        col.appendChild(tempHeader);
        rawTable.appendChild(col);
    }

    for (let i = 0; i < RAW_ROWS.length; i++) {
        for (let s = 0; s < RAW_FIELDS_ORDER.length; s++) {

            // Temp data value html element
            let tempDataValue = document.createElement("div");
            tempDataValue.className = "data-value";
            tempDataValue.id = i;
            // Adds the nice norizontal stripes, easier to read
            if (i % 3 == 0) {
                tempDataValue.style.backgroundColor = "#302f2b";
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
                    setRowHighlight(this.id, false);
                });
            }
            rawTable.children[s + 1].appendChild(tempDataValue);
        }
    }
}

function showTeamData() {

    let dataType = localStorage.getItem('team-table-type-select');
    let showPercentiles = localStorage.getItem('showTeamPercentileColor');


    rawTable.innerHTML = '';

    // Add select to navigate between raw/team data
    let tableHeaderContainer = document.createElement('div');
    tableHeaderContainer.id = 'table-header-container';
    tableHeaderContainer.innerHTML = `<select id='table-type-select' value='raw'><option value="team" selected>Team Data</option><option value="raw">Raw Data</option></select> <label for='team-table-type-select' style='margin-left: 7vh;'>Viewing:</label> <select id='team-table-type-select' style='width: fit-content'><option value='mean'>MEAN</option><option value='median'>MEDIAN</option><option value='max'>MAX</option><option value='min'>MIN</option></select>         <label for='team-table-percentile-select' style='margin-left: 7vh;'>Percentiles:</label> <select id='team-table-percentile-select' style='width: fit-content'>   <option value='Yes'>Yes</option>   <option value='No'>No</option>   </select>`;
    rawTable.appendChild(tableHeaderContainer);
    document.getElementById('team-table-type-select').value = dataType;
    document.getElementById('team-table-percentile-select').value = showPercentiles;

    document.getElementById('table-type-select').addEventListener('change', function (e) {
        if (document.getElementById('table-type-select').value == 'raw') {
            showRawData();
        }
    });

    document.getElementById('team-table-type-select').addEventListener('change', function (e) {
        localStorage.setItem('team-table-type-select', document.getElementById('team-table-type-select').value);
        showTeamData();
    });

    document.getElementById('team-table-percentile-select').addEventListener('change', function (e) {
        localStorage.setItem('showTeamPercentileColor', document.getElementById('team-table-percentile-select').value);
        showTeamData();
    });

    // Create the column headers
    for (let h = 0; h < TEAM_FIELDS_ORDER.length; h++) {
        // Temp column
        let col = document.createElement('div');
        // Temp header
        let tempHeader = document.createElement('div');

        // Temp header text
        let tempHeaderText = document.createElement('h3');
        tempHeaderText.innerText = camelCaseToWords(TEAM_FIELDS_ORDER[h]);
        tempHeader.appendChild(tempHeaderText);
        tempHeader.className = 'table-header-section-raw';
        // Adds column number to header class list
        tempHeader.classList.add(`${(h)}`);
        // FIXME Sorts the column, passes column number, if it's numerical (NOPE), records, columns, fields, isTeam idk what else
        tempHeader.onclick = function () { sortTeamColumn(this.classList[1], TEAM_ROWS[localStorage.getItem('team-table-type-select')], TEAM_COLUMNS[localStorage.getItem('team-table-type-select')], TEAM_FIELDS_ORDER) };

        col.className = 'column';
        col.appendChild(tempHeader);
        rawTable.appendChild(col);
    }

    // Add team number, then the rest of the data
    for (let i = 0; i < TEAM_RECORDS.length; i++) {
        for (let s = 0; s < TEAM_FIELDS_ORDER.length; s++) {

            // Temp data value html element
            let tempDataValue = document.createElement('div');
            tempDataValue.className = 'data-value';
            tempDataValue.id = i;
            // Adds the nice norizontal stripes, easier to read
            if (i % 3 == 0) {
                tempDataValue.style.backgroundColor = '#302f2b';
            }

            let value = TEAM_RECORDS[i][dataType][TEAM_FIELDS_ORDER[s]];

            // Otherwise highlight the correct row
            tempDataValue.innerText = value;
            // id is the row the cell is in
            tempDataValue.addEventListener('click', function () {
                setRowHighlight(this.id, false);
            });

            // Check if it requires special color coding
            tempDataValue.style.boxShadow = ``;
            if (TEAM_PERCENTILE_FIELDS.includes(TEAM_FIELDS_ORDER[s]) && showPercentiles != 'No') {
                if (parseInt(value) >= TEAM_PERCENTILES[dataType]['90'][TEAM_PERCENTILE_FIELDS.indexOf(TEAM_FIELDS_ORDER[s])])
                    tempDataValue.style.boxShadow = `inset 1vh 1vh ${teamRankColors[3]}, inset -1vh -1vh ${teamRankColors[3]}`;
                else if (parseInt(value) <= TEAM_PERCENTILES[dataType]['10'][TEAM_PERCENTILE_FIELDS.indexOf(TEAM_FIELDS_ORDER[s])])
                    tempDataValue.style.boxShadow = `inset 1vh 1vh ${teamRankColors[0]}, inset -1vh -1vh ${teamRankColors[0]}`;
                else if (parseInt(value) <= TEAM_PERCENTILES[dataType]['25'][TEAM_PERCENTILE_FIELDS.indexOf(TEAM_FIELDS_ORDER[s])])
                    tempDataValue.style.boxShadow = `inset 1vh 1vh ${teamRankColors[1]}, inset -1vh -1vh ${teamRankColors[1]}`;
                else if (parseInt(value) >= TEAM_PERCENTILES[dataType]['75'][TEAM_PERCENTILE_FIELDS.indexOf(TEAM_FIELDS_ORDER[s])])
                    tempDataValue.style.boxShadow = `inset 1vh 1vh ${teamRankColors[2]}, inset -1vh -1vh ${teamRankColors[2]}`;
            }

            rawTable.children[s + 1].appendChild(tempDataValue);
        }
    }
}

function camelCaseToWords(s) {
    const result = s.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
}

// Shows team comment modal, sets correct text
function showCommentModal(text) {
    // Show modal
    commentModal.style.display = "block";
    // Set modal text to comment
    commentModal.children[0].children[1].innerText = text;
}

// Close comment modal if you click off of it
window.onclick = function (event) {
    if (event.target == commentModal) {
        commentModal.style.display = "none";
    }
}

// Close comment modal when close button is clicked
closeCommentModal.onclick = function () {
    commentModal.style.display = "none";
}

// Sets the row highlight in the team data table
function setTeamRowHighlight(row, always) {
    // Team column html elements
    let cols = document.getElementsByClassName("column");

    // Resets the column highlights back to normal every 3rd striped
    for (let c = 0; c < cols.length; c++) {
        for (let i = 1; i < cols[c].children.length; i++) {
            if ((i - 1) % 3 == 0) {
                cols[c].children[i].style.backgroundColor = "#302f2b";
            } else {
                cols[c].children[i].style.backgroundColor = "#474540";
            }
        }
    }

    // If the previously highlighted row was different than the currently highlighted row
    // Or it's a special always highlight (for comments and stuff)
    if (localStorage.getItem("previousHighlightRow") != row || always) {
        localStorage.setItem("previousHighlightRow", row);
        // Loop through the team rows and try to match the team number to the desired team number to highlight
        for (let i = 0; i < TEAM_ROWS.length; i++) {
            if (cols[0].children[i + 1].innerText == TEAMS[row]) {
                // When a match is found iterate through all columns highlighting the correct data cell
                for (let c = 0; c < cols.length; c++) {
                    cols[c].children[i + 1].style.setProperty("background-color", "#a8652d", "important");
                }
                // Now break because we already found the correct row to highlight
                break;
            }
        }
    } else {
        // Otherwise the highlight should be toggled off, reset previous highlight row
        localStorage.setItem("previousHighlightRow", -1);
    }
}

// Sets row highlight in raw data table
function setRowHighlight(row, always) {
    //FIXME ROW IS A STRING FOR SOME REASON FIX!!!

    let cols = document.getElementsByClassName("column");
    for (let c = 0; c < cols.length; c++) {
        for (let i = 1; i < cols[c].children.length; i++) {
            if ((i - 1) % 3 == 0) {
                cols[c].children[i].style.backgroundColor = "#302f2b";
            } else {
                cols[c].children[i].style.backgroundColor = "#474540";
            }
        }
    }

    if (localStorage.getItem("previousHighlightRawRow") != row || always) {
        localStorage.setItem("previousHighlightRawRow", row);
        for (let c = 0; c < cols.length; c++) {
            // For now I'm just casting row as an integer ;)
            cols[c].children[parseInt(row) + 1].style.setProperty("background-color", "#a8652d", "important");
        }
    } else {
        localStorage.setItem("previousHighlightRawRow", -1);
    }
}

var graphTabGraph;

// Sorts teams based on column
function getSortedIndex(colNum, records, columns) {
    var sortedColumn = JSON.parse(JSON.stringify(columns));
    sortedColumn = sortedColumn[colNum].sort(function (a, b) { return a - b });

    let sortedRows = [];
    var previousRows = [];
    var takenRows = [];
    var counter = 0;

    var tempColumns = JSON.parse(JSON.stringify(columns));

    for (var r = 0; r < records.length; r++) {
        for (var i = 0; i < tempColumns[0].length; i++) {
            //console.log(tempColumns[colNum][i]);
            //console.log(takenRows.includes(i));
            if (columns[colNum][i] == sortedColumn[r] && !takenRows.includes(i)) {
                sortedRows[counter] = records[i];
                previousRows[counter] = i;
                takenRows[counter] = i;
                counter++;
                break;
            }
        }
    }

    //console.log(sortedRows);

    return sortedRows;
}

// TODO Document & clean up this function
function sortRawColumn(colNum, records, columns, field) {

    // I'm changing this lol only sort if it's a team value as well so it's numerical
    if (!TEAM_FIELDS_ORDER.includes(field[colNum]) && field[colNum] != 'matchNumber' && field[colNum] != 'teamNumber')
        return;

    var direction = parseInt(localStorage.getItem("direction"));
    var previousColumn = parseInt(localStorage.getItem("column"));
    // set headers to color, then highlight current one
    let tempHeaders = document.getElementsByClassName("table-header-section-raw");
    for (let headerNum = 0; headerNum < tempHeaders.length; headerNum++) {
        tempHeaders[headerNum].style.backgroundColor = "#333333";
    }
    tempHeaders[colNum].style.backgroundColor = "#995303";

    // Check column to be sorted & direction
    localStorage.setItem("column", colNum);
    localStorage.setItem("direction", parseInt(direction) + 1);
    if (previousColumn != colNum) {
        direction = 0;
        localStorage.setItem("direction", 1);
    }

    // The root (trademarked by Mason McManus, 2023-2026).
    let root = document.querySelector(":root");

    // Cool gradient stuff
    var cols = document.getElementsByClassName("column");
    for (var i = 0; i < cols.length; i++) {
        cols[i].style.background = "";
    }
    if (direction % 3 == 1) {
        cols[colNum].style.background = `linear-gradient(180deg, ${getComputedStyle(root).getPropertyValue("--data-table")} 0%, rgba(255,158,0,1) 100%)`;
        cols[colNum].style.animation = `column-sort-up ${2.5}s linear infinite`;
    } else {
        cols[colNum].style.background = `linear-gradient(0deg, ${getComputedStyle(root).getPropertyValue("--data-table")} 0%, rgba(255,158,0,1) 100%)`;
        cols[colNum].style.animation = `column-sort-down ${2.5}s linear infinite`;
    }
    cols[colNum].style.backgroundSize = "100vh 35vh";

    // What in the hell is this
    // Ok I fixed...

    let sortedColumn;
    // Sort the column
    if (direction % 3 == 1) {
        // Ascending
        sortedColumn = columns[colNum].toSorted(function (a, b) { return a - b });
    } else if (direction % 3 == 0) {
        // Descending
        sortedColumn = columns[colNum].toSorted(function (a, b) { return b - a });
    } else {
        // Ok now just reset the table
        showRawData();
        return;
    }

    // Wow, with variable inflation this may cost a lot in the big 25
    var sortedRows = [];
    var previousRows = [];
    var takenRows = [];
    var counter = 0;

    var tempColumns = JSON.parse(JSON.stringify(columns));

    for (var r = 0; r < records.length; r++) {
        for (var i = 0; i < tempColumns[0].length; i++) {
            //console.log(tempColumns[colNum][i]);
            //console.log(takenRows.includes(i));
            if (columns[colNum][i] == sortedColumn[r] && !takenRows.includes(i)) {
                sortedRows[counter] = records[i];
                previousRows[counter] = i;
                takenRows[counter] = i;
                counter++;
                break;
            }
        }
    }

    var cols = document.getElementsByClassName("column");
    for (var i = 0; i < sortedRows.length; i++) {
        for (var s = 0; s < cols.length; s++) {
            var tempCol = cols[s];
            var temp = tempCol.children[i + 1];
            //if (isTeam) {
            //temp.classList[1] = i;
            //}

            if (field[s].includes("comment") || field[s].includes("human")) {
                temp.innerText = "{ View }";
                temp.id = i;
                temp.classList.add(s);
                temp.onclick = function () { showCommentModal(sortedRows[this.id][this.classList[1]]) }
                temp.addEventListener("click", function () {
                    setRowHighlight(this.id, true);
                });
            } else {
                /*if (isTeam) {
                    if (s == 0) {
                        for (var q = 0; q < sortedRows.length; q++) {
                            if (sortedRows[i][0] == TEAMS[q]) {
                                temp.id = q;
                            }
                        }
                    }
                }*/
                temp.innerText = sortedRows[i][s];
            }
            temp.style.boxShadow = '';
        }
    }
    // This code is a mess
    /*
        if (isTeam) {
            /*if (parseInt(localStorage.getItem("previousHighlightRow")) != -1) {
                var previousTeam = TEAMS[parseInt(localStorage.getItem("previousHighlightRow"))];
                var originalHighlight = localStorage.getItem("previousHighlightRow");
                console.log(previousTeam);
                for (var i = 0; i < sortedRows.length; i++) {
                    if (sortedRows[i][0] == previousTeam) {
                        setRowHighlight(i, true);
                        localStorage.setItem("previousHighlightRow", originalHighlight);
                    }
                }
            }*/
    /*for (let i = 0; i < sortedRows.length; i++) {
        for (let t = 0; t < TEAMS.length; t++) {
            if (sortedRows[i][0] == TEAMS[t]) {
                for (let c = 0; c < cols.length; c++) {
                    cols[c].children[i + 1].classList = "data-value";
                    cols[c].children[i + 1].classList.add(t);
                }
                break;
            }
        }
    }
    if (parseInt(localStorage.getItem("previousHighlightRow")) != -1) {
        setTeamRowHighlight(localStorage.getItem("previousHighlightRow"), true);
    }

    if (highlightTeamData) {
        let columnCopy = JSON.parse(JSON.stringify(TEAM_COLUMNS));
        for (let c = 0; c < TEAM_COLUMNS.length - 1; c++) {
            let cols = document.getElementsByClassName("column")[c];

            let filteredColumn = [...new Set(columnCopy[c].sort((a, b) => a - b))];
            //console.log(filteredColumn);
            for (let i = 0; i < TEAM_COLUMNS[c].length; i++) {
                let color = filteredColumn.indexOf(parseFloat(cols.children[i + 1].innerText)) / (filteredColumn.length - 1);
                cols.children[i + 1].style.boxShadow = `0px 0px 0px 100vh inset rgba(${(1 - color) * 255}, ${color * 255}, 0, ${Math.pow(Math.abs(color - 0.5) * 1.85, 2)})`;
            }
        }
    }
}*/
}

function sortTeamColumn(colNum, records, columns, field) {

    // I'm changing this lol only sort if it's a team value as well so it's numerical
    if (!TEAM_FIELDS_ORDER.includes(field[colNum]) && field[colNum] != 'matchNumber' && field[colNum] != 'teamNumber')
        return;

    let dataType = localStorage.getItem('team-table-type-select');
    let showPercentiles = localStorage.getItem('showTeamPercentileColor');

    var direction = parseInt(localStorage.getItem("direction"));
    var previousColumn = parseInt(localStorage.getItem("column"));
    // set headers to color, then highlight current one
    let tempHeaders = document.getElementsByClassName("table-header-section-raw");
    for (let headerNum = 0; headerNum < tempHeaders.length; headerNum++) {
        tempHeaders[headerNum].style.backgroundColor = "#333333";
    }
    tempHeaders[colNum].style.backgroundColor = "#995303";

    // Check column to be sorted & direction
    localStorage.setItem("column", colNum);
    localStorage.setItem("direction", parseInt(direction) + 1);
    if (previousColumn != colNum) {
        direction = 0;
        localStorage.setItem("direction", 1);
    }

    // The root (trademarked by Mason McManus, 2023-2026).
    let root = document.querySelector(":root");

    // Cool gradient stuff
    var cols = document.getElementsByClassName("column");
    for (var i = 0; i < cols.length; i++) {
        cols[i].style.background = "";
    }
    if (direction % 3 == 1) {
        cols[colNum].style.background = `linear-gradient(180deg, ${getComputedStyle(root).getPropertyValue("--data-table")} 0%, rgba(255,158,0,1) 100%)`;
        cols[colNum].style.animation = `column-sort-up ${2.5}s linear infinite`;
    } else {
        cols[colNum].style.background = `linear-gradient(0deg, ${getComputedStyle(root).getPropertyValue("--data-table")} 0%, rgba(255,158,0,1) 100%)`;
        cols[colNum].style.animation = `column-sort-down ${2.5}s linear infinite`;
    }
    cols[colNum].style.backgroundSize = "100vh 35vh";

    let sortedColumn;
    // Sort the column
    if (direction % 3 == 1) {
        // Ascending
        sortedColumn = columns[colNum].toSorted(function (a, b) { return a - b });
    } else if (direction % 3 == 0) {
        // Descending
        sortedColumn = columns[colNum].toSorted(function (a, b) { return b - a });
    } else {
        // Ok now just reset the table
        showTeamData();
        return;
    }

    // Wow, with variable inflation this may cost a lot in the big 25
    var sortedRows = [];
    var previousRows = [];
    var takenRows = [];
    var counter = 0;

    var tempColumns = JSON.parse(JSON.stringify(columns));

    for (var r = 0; r < records.length; r++) {
        for (var i = 0; i < tempColumns[0].length; i++) {
            if (columns[colNum][i] == sortedColumn[r] && !takenRows.includes(i)) {
                sortedRows[counter] = records[i];
                previousRows[counter] = i;
                takenRows[counter] = i;
                counter++;
                break;
            }
        }
    }

    var cols = document.getElementsByClassName("column");
    for (var i = 0; i < sortedRows.length; i++) {
        for (var s = 0; s < cols.length; s++) {
            var tempCol = cols[s];
            var temp = tempCol.children[i + 1];
            temp.classList[1] = i;
            let value = sortedRows[i][s];

            if (field[s].includes("comment") || field[s].includes("human")) {
                temp.innerText = "{ View }";
                temp.id = i;
                temp.classList.add(s);
                temp.onclick = function () { showCommentModal(sortedRows[this.id][this.classList[1]]) }
                temp.addEventListener("click", function () {
                    setRowHighlight(this.id, true);
                });
            } else {
                if (s == 0) {
                    for (var q = 0; q < sortedRows.length; q++) {
                        if (sortedRows[i][0] == TEAMS[q]) {
                            temp.id = q;
                        }
                    }
                }
                temp.innerText = value;
            }

            temp.style.boxShadow = ``;
            if (TEAM_PERCENTILE_FIELDS.includes(TEAM_FIELDS_ORDER[s]) && showPercentiles != 'No') {
                if (parseInt(value) >= TEAM_PERCENTILES[dataType]['90'][TEAM_PERCENTILE_FIELDS.indexOf(TEAM_FIELDS_ORDER[s])])
                    temp.style.boxShadow = `inset 1vh 1vh ${teamRankColors[3]}, inset -1vh -1vh ${teamRankColors[3]}`;
                else if (parseInt(value) <= TEAM_PERCENTILES[dataType]['10'][TEAM_PERCENTILE_FIELDS.indexOf(TEAM_FIELDS_ORDER[s])])
                    temp.style.boxShadow = `inset 1vh 1vh ${teamRankColors[0]}, inset -1vh -1vh ${teamRankColors[0]}`;
                else if (parseInt(value) <= TEAM_PERCENTILES[dataType]['25'][TEAM_PERCENTILE_FIELDS.indexOf(TEAM_FIELDS_ORDER[s])])
                    temp.style.boxShadow = `inset 1vh 1vh ${teamRankColors[1]}, inset -1vh -1vh ${teamRankColors[1]}`;
                else if (parseInt(value) >= TEAM_PERCENTILES[dataType]['75'][TEAM_PERCENTILE_FIELDS.indexOf(TEAM_FIELDS_ORDER[s])])
                    temp.style.boxShadow = `inset 1vh 1vh ${teamRankColors[2]}, inset -1vh -1vh ${teamRankColors[2]}`;
            }
        }
    }
    // This code is a mess

    if (parseInt(localStorage.getItem("previousHighlightRow")) != -1) {
        var previousTeam = TEAMS[parseInt(localStorage.getItem("previousHighlightRow"))];
        var originalHighlight = localStorage.getItem("previousHighlightRow");
        console.log(previousTeam);
        for (var i = 0; i < sortedRows.length; i++) {
            if (sortedRows[i][0] == previousTeam) {
                setRowHighlight(i, true);
                localStorage.setItem("previousHighlightRow", originalHighlight);
            }
        }
    }
    for (let i = 0; i < sortedRows.length; i++) {
        for (let t = 0; t < TEAMS.length; t++) {
            if (sortedRows[i][0] == TEAMS[t]) {
                for (let c = 0; c < cols.length; c++) {
                    cols[c].children[i + 1].classList = "data-value";
                    cols[c].children[i + 1].classList.add(t);
                }
                break;
            }
        }
    }
    if (parseInt(localStorage.getItem("previousHighlightRow")) != -1) {
        setTeamRowHighlight(localStorage.getItem("previousHighlightRow"), true);
    }

    if (highlightTeamData) {
        let columnCopy = JSON.parse(JSON.stringify(TEAM_COLUMNS));
        for (let c = 0; c < TEAM_COLUMNS.length - 1; c++) {
            let cols = document.getElementsByClassName("column")[c];

            let filteredColumn = [...new Set(columnCopy[c].sort((a, b) => a - b))];
            //console.log(filteredColumn);
            for (let i = 0; i < TEAM_COLUMNS[c].length; i++) {
                let color = filteredColumn.indexOf(parseFloat(cols.children[i + 1].innerText)) / (filteredColumn.length - 1);
                cols.children[i + 1].style.boxShadow = `0px 0px 0px 100vh inset rgba(${(1 - color) * 255}, ${color * 255}, 0, ${Math.pow(Math.abs(color - 0.5) * 1.85, 2)})`;
            }
        }
    }

}

function originalSort(record, column, field) {
    let cols = document.getElementsByClassName("column");
    for (let x = 0; x < record.length; x++) {
        for (let y = 0; y < record[x].length - 1; y++) {
            //console.log(RECORDS[i][s]);
            let tempCol = cols[y];
            let temp = tempCol.children[x + 1];
            temp.innerText = column[y][x];
        }
    }
}

function toggleSidebar() {
    sidebarOpen = !sidebarOpen;

    if (sidebarOpen) {
        tl.to(sidebar, { left: "0vh", duration: 0.5, ease: "power2" });
        //tl.to("#team-breakdown-select", { left: "0vh", duration: 0.5, ease: "power2" });
        tl.to(openSidebarButton, { scale: "1 1", duration: 0.5, ease: "power2" }, "-=0.5");
    } else {
        if (window.innerWidth > window.innerHeight)
            tl.to(sidebar, { left: "-27vh", duration: 0.5, ease: "power2" });
        else
            tl.to(sidebar, { left: "-100vw", duration: 0.5, ease: "power2" });
        //tl.to("#team-breakdown-select", { left: "34vh", duration: 0.5, ease: "power2" });
        tl.to(openSidebarButton, { scale: "-1 1", duration: 0.5, ease: "power2" }, "-=0.5");
    }
}

// Gets all events & populates event select with them
function getEventListTBA(url) {
    fetch(url, tbaOptions)
        .then((response) => response.json())
        .then((json) => {
            //console.log(json.length);
            eventSelect.innerHTML = "";
            // Sorts the array (smartly called 'json' for some reason) by object property name
            json = json.sort((a, b) => (a.name > b.name ? 1 : -1));
            for (var i = 0; i < json.length; i++) {
                TBA_EVENT_NAMES[i] = json[i].name;
                var tempOption = document.createElement("option");
                tempOption.innerText = json[i].name;
                tempOption.value = json[i].key;
                if (json[i].key == localStorage.getItem("event-key")) {
                    tempOption.selected = "selected";
                }
                eventSelect.appendChild(tempOption);

                // Shorten event name if it's ridiculously long
                if (TBA_EVENT_NAMES[i].length > 25) {
                    TBA_EVENT_NAMES[i] = TBA_EVENT_NAMES[i].substring(0, 25);
                }
            }

        });
}

// Toggles settings tab
function toggleSettings() {
    settingsOpen = !settingsOpen;
    if (settingsOpen) {
        settings.style.display = "flex";
        body.style.overflow = "hidden";
    } else {
        settings.style.display = "none";
        body.style.overflow = "auto";
        localStorage.setItem("event-key", eventSelect.value);
        localStorage.setItem("spreadsheet-url", urlInput.value);
    }
}

// Sleep command for functions
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}