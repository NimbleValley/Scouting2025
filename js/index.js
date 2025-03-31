// TODO Everything haha 

console.log(math.sqrt(-4).toString())

// Animation timeline
var tl = new TimelineMax();

// The body
const body = document.body;

// For later, not done yet
var DARK_COLOR_SCHEME = true;
setColorScheme();

let badCompareValues = [5, 8, 10];

// Sidebar variables, self explanatory
const sidebar = document.getElementById("sidebar");
const openSidebarButton = document.getElementById("open-sidebar");
const sidebarButtonContainer = document.getElementById("side-button-container");
if (window.innerHeight > window.innerWidth) {
    openSidebarButton.innerText = "≡";
    sidebarButtonContainer.removeChild(sidebarButtonContainer.children[sidebarButtonContainer.childElementCount - 1]);
}
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

const teamDataToKeep = ['Team Number', 'Total Points', 'Auto Points', 'Tele Points', 'Endgame Points', 'Auto L4', 'Auto L3', 'Auto L2', 'Auto L1', 'Auto Processor', 'Auto Net', 'Auto Algae Removed', 'Auto Miss', 'Auto Coral', 'Tele L4', 'Tele L3', 'Tele L2', 'Tele L1', 'Tele Processor', 'Tele Net', 'Tele Algae Removed', 'Tele Miss', 'Tele Coral', 'Total Net', 'Total Processor', 'Total Algae Removed', 'Total Coral', 'Driver Rating', 'Intake Rating', 'Cycle Rating', 'Pick Rating'];
const breakdownCategories = ['Total Points', 'Auto Points', 'Tele Points', 'Endgame Points', 'Auto Coral', 'Tele Coral', 'Total Net', 'Total Processor', 'Total Algae Removed'];
const consistencyCategories = ['Total Points', 'Auto Points', 'Tele Points', 'Endgame Points', 'Auto Miss', 'Tele Miss', 'Auto Coral', 'Tele Coral', 'Total Net', 'Total Processor', 'Total Algae Removed'];

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


// HTML data table element, for raw and team data
const rawTable = document.getElementById("data-table");


// All data field names
var FIELDS = new Array();
// Fields that apply to teams, only numbers
var TEAM_FIELDS = new Array();
// Records, arranged in rows
var RECORDS = new Array();
// Records, arranged in columns
var COLUMNS = new Array();


// FIXME Very important this is set correctly!
const TEAM_INDEX = 0;
// Data arranged by team, in rows
var TEAM_ROWS = new Array();
// Data arranged by team, in columns
var TEAM_COLUMNS = new Array();
// List of all teams
var TEAMS = new Array();
// Array of how many times each team has flipped
var TEAMS_FLIPPED = new Array();
// Array of how many times each team has lost comms
var TEAMS_COMMS = new Array();
// Array of how many times each team has been disabled D:
var TEAMS_DISABLED = new Array();
// Array of how many times each team acted dumb/unintelligent
var TEAMS_DUMB = new Array();
// Array of how many times each team drove reckless
var TEAMS_RECKLESS = new Array();

var TEAM_MATCHES = [];

var highlightTeamData;

localStorage.getItem("team-color-rank-highlight") != null ? highlightTeamData = JSON.parse(localStorage.getItem("team-color-rank-highlight")) : highlightTeamData = false;

const highlightSelect = document.getElementById("highlight-select");
highlightSelect.addEventListener('change', function () {
    highlightTeamData = JSON.parse(highlightSelect.value);
    localStorage.setItem("team-color-rank-highlight", highlightSelect.value);
});

highlightSelect.value = highlightTeamData;

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
getData();

// Fetches raw data table
function getData() {
    // Make raw data side button active
    removeActive();
    sideButtons[1].classList.add("active");

    TEAM_MATCHES = [];

    // Hide other tabs
    graphContainer.style.display = "none";

    rawTable.innerHTML = "<h5>Fetching Spreadsheet...</h5>";
    CSV.fetch({
        url: urlInput.value
    }
    ).done(function (dataset) {
        // Reset all variables
        rawTable.innerHTML = "";
        FIELDS = dataset.fields;
        RECORDS = dataset.records;
        TEAMS = [];

        let tempTeamNumbers = [];
        let tempTeamFrequencies = [];

        //Delete Names
        for (let i = 0; i < RECORDS.length; i++) {
            RECORDS[i].splice(0, 1);
            if (!tempTeamNumbers.includes(RECORDS[i][0])) {
                tempTeamNumbers.push(RECORDS[i][0]);
                tempTeamFrequencies.push(1);
            } else {
                tempTeamFrequencies[tempTeamNumbers.indexOf(RECORDS[i][0])]++;
            }
        }
        FIELDS.splice(0, 1);

        for (let i = 0; i < tempTeamNumbers.length; i++) {
            if (tempTeamFrequencies[i] < 3) {
                console.error(`TEAM ${tempTeamNumbers[i]} MAY BE FAKE, REMOVING...`);
            }
        }

        if (RECORDS.length > 120) {
            // CLEAN POSSIBLY FAKE TEAMS
            for (let i = 0; i < RECORDS.length; i++) {
                if (tempTeamFrequencies[tempTeamNumbers.indexOf(RECORDS[i][0])] < 3) {
                    RECORDS.splice(i, 1);
                    i--;
                }
            }
        }

        // Update teams array & sort
        for (let i = 0; i < RECORDS.length; i++) {
            if (!TEAMS.includes(RECORDS[i][0])) {
                TEAMS[TEAMS.length] = RECORDS[i][0];
            }
        }
        TEAMS.sort(function (a, b) { return a - b });
        //console.log(TEAMS);

        RECORDS.sort(function (a, b) {
            return a[FIELDS.indexOf('Match Number')] - b[FIELDS.indexOf('Match Number')];
        });

        for (let t = 0; t < TEAMS.length; t++) {
            let tempMatches = [];
            for (let m = 0; m < RECORDS.length; m++) {
                if (RECORDS[m][TEAM_INDEX] == TEAMS[t]) {
                    tempMatches.push(RECORDS[m]);
                }
            }
            TEAM_MATCHES.push(tempMatches);
        }

        localStorage.setItem("direction", 0);
        localStorage.setItem("column", -1);
        getTeamData();
    }).catch(error => {
        // Oh no :(
        console.log(error);
        alert('Terrible Error :(.');
        let montyWindow = window.open("", "Error Report");
        montyWindow.document.body.innerHTML = `<h3>${error}</h3>`;
        if (error == "TypeError: Failed to fetch") {
            montyWindow.document.body.innerHTML = `<h3>Check Internet Connection: ${error}</h3>`;
        }
    });
}

// Opens raw data table, resets raw data table
function resetRaw() {
    graphContainer.style.display = "none";

    rawTable.innerHTML = "";
    TEAMS_FLIPPED = [];
    TEAMS_COMMS = [];
    TEAMS_DISABLED = [];
    TEAMS_DUMB = [];
    TEAMS_RECKLESS = [];

    let tableHeaderContainer = document.createElement('div');
    tableHeaderContainer.id = 'table-header-container';
    tableHeaderContainer.innerHTML = `<select id='table-type-select' value='raw'><option value="team">Team Data</option><option value="raw" selected>Raw Data</option></select> <label for='raw-match-number-input' style='margin-left: 7vh;'>Jump to match:</label><input type='text' id='raw-match-number-input'>   <label for='specific-team-matches-select' style='margin-left: 7vh;'>Specific team:</label> <select id='specific-team-matches-select'><option value='-1'>ALL</option></select>`;
    rawTable.appendChild(tableHeaderContainer);

    let specificTeamMatchesSelect = document.getElementById('specific-team-matches-select');
    for (let i = 0; i < TEAMS.length; i++) {
        if (parseInt(TEAMS[i]) == -1) {
            continue;
        }
        let tempTeamOption = document.createElement('option');
        tempTeamOption.innerText = TEAMS[i];
        tempTeamOption.value = TEAMS[i];
        specificTeamMatchesSelect.appendChild(tempTeamOption);
    }
    specificTeamMatchesSelect.addEventListener('change', function () {
        if (parseInt(specificTeamMatchesSelect.value) == -1) {
            resetRaw();
        } else {
            resetRawByTeam(specificTeamMatchesSelect.value);
        }
    });

    document.getElementById('table-type-select').addEventListener('change', function (e) {
        if (document.getElementById('table-type-select').value == 'team') {
            getTeamData();
        }
    });

    document.getElementById('raw-match-number-input').addEventListener('change', function (e) {
        let desiredMatch = parseInt(document.getElementById('raw-match-number-input').value);
        let matchNumberColumnIndex = FIELDS.indexOf('Match Number');
        let column = document.getElementsByClassName('column')[matchNumberColumnIndex];

        for (let i = 1; i < column.children.length; i++) {
            if (parseInt(column.children[i].innerText) == desiredMatch) {
                column.children[i].scrollIntoView({
                    block: 'center',
                    behavior: 'smooth' // Optional for smooth scrolling
                });
                setRowHighlight(i - 1, true);
                return;
            }
        }
    });

    for (let h = 0; h < FIELDS.length; h++) {
        COLUMNS[h] = new Array();
        // Temp column
        let col = document.createElement("div");
        // Temp header
        let tempHeader = document.createElement("div");

        // Temp header text
        let tempHeaderText = document.createElement("h3");
        tempHeaderText.innerText = FIELDS[h];
        tempHeader.appendChild(tempHeaderText);
        tempHeader.className = "table-header-section-raw";

        // Sets data type to first character in the first row of desired column,
        // used to see if data can be sorted numerically 
        let dataType = 1;
        if (RECORDS.length > 0) {
            dataType = new String(RECORDS[0][h]).substring(0, 1);
        }
        // Stores the data type as the header id 
        // TODO there is probably a more stable and better way to do this
        tempHeader.id = dataType;
        tempHeader.dataset.dataType = dataType;
        // Adds column number to header class list
        tempHeader.classList.add(`${(h)}`);
        // FIXME Sorts the column, passes column number, if it's numerical, records, columns, fields, idk what else
        tempHeader.onclick = function () { sortColumn(this.classList[1], detectCharacter(this.id), RECORDS, COLUMNS, FIELDS, false, true) };

        col.className = "column";
        col.appendChild(tempHeader);
        rawTable.appendChild(col);
    }

    // Resets sort direction & column
    localStorage.setItem("direction", 0);
    localStorage.setItem("column", -1);

    for (let i = 0; i < RECORDS.length; i++) {
        for (let s = 0; s < RECORDS[i].length; s++) {
            // Updates teams flipped, comms, etc.
            if (FIELDS[s] == "Too Tall") {
                if (RECORDS[i][s] == "Yes") {
                    TEAMS_FLIPPED.push(RECORDS[i][TEAM_INDEX]);
                }
            }
            if (FIELDS[s] == "Lost Comms") {
                if (RECORDS[i][s] == "Yes") {
                    TEAMS_COMMS.push(RECORDS[i][TEAM_INDEX]);
                }
            }
            if (FIELDS[s] == "Disabled") {
                if (RECORDS[i][s] == "Yes") {
                    TEAMS_DISABLED.push(RECORDS[i][TEAM_INDEX]);
                }
            }
            if (FIELDS[s].includes("Unintelligent")) {
                if (RECORDS[i][s] == "Yes") {
                    TEAMS_DUMB.push(RECORDS[i][TEAM_INDEX]);
                }
            }
            if (FIELDS[s] == "Reckless") {
                if (RECORDS[i][s] == "Yes") {
                    TEAMS_RECKLESS.push(RECORDS[i][TEAM_INDEX]);
                }
            }
            // Adds to columns
            COLUMNS[s][i] = RECORDS[i][s];

            // Temp data value html element
            let tempDataValue = document.createElement("div");
            tempDataValue.className = "data-value";
            tempDataValue.id = i;
            // Adds the nice norizontal stripes, easier to read
            if (i % 3 == 0) {
                tempDataValue.style.backgroundColor = "#302f2b";
            }

            // Special cases where clicking does another behavior, such as opening comments section
            if (FIELDS[s].includes("Comments") || FIELDS[s].includes("Human Player Notes")) {
                tempDataValue.innerText = "{ View }";
                tempDataValue.id = i;
                tempDataValue.classList.add(s);
                tempDataValue.onclick = function () { showCommentModal(RECORDS[this.id][this.classList[1]]) }
                tempDataValue.addEventListener("click", function () {
                    setRowHighlight(this.id, true);
                });
            } else {
                // Otherwise highlight the correct row
                tempDataValue.innerText = RECORDS[i][s];
                // id is the row the cell is in
                tempDataValue.addEventListener("click", function () {
                    setRowHighlight(this.id, false);
                });
            }
            rawTable.children[s + 1].appendChild(tempDataValue);
        }
    }
}

// Opens raw data table for certain team's matches
function resetRawByTeam(team) {
    graphContainer.style.display = "none";

    rawTable.innerHTML = "";

    let tableHeaderContainer = document.createElement('div');
    tableHeaderContainer.id = 'table-header-container';
    tableHeaderContainer.innerHTML = `<select id='table-type-select' value='raw'><option value="team">Team Data</option><option value="raw" selected>Raw Data</option></select> <label for='raw-match-number-input' style='margin-left: 7vh;'>Jump to match:</label><input type='text' id='raw-match-number-input'>   <label for='specific-team-matches-select' style='margin-left: 7vh;'>Specific team:</label> <select id='specific-team-matches-select'><option value='-1'>ALL</option></select>`;
    rawTable.appendChild(tableHeaderContainer);

    let specificTeamMatchesSelect = document.getElementById('specific-team-matches-select');
    for (let i = 0; i < TEAMS.length; i++) {
        if (parseInt(TEAMS[i]) == -1) {
            continue;
        }
        let tempTeamOption = document.createElement('option');
        tempTeamOption.innerText = TEAMS[i];
        tempTeamOption.value = TEAMS[i];
        specificTeamMatchesSelect.appendChild(tempTeamOption);
    }
    specificTeamMatchesSelect.value = team;
    specificTeamMatchesSelect.addEventListener('change', function () {
        if (parseInt(specificTeamMatchesSelect.value) == -1) {
            resetRaw();
        } else {
            resetRawByTeam(specificTeamMatchesSelect.value);
        }
    });

    document.getElementById('table-type-select').addEventListener('change', function (e) {
        if (document.getElementById('table-type-select').value == 'team') {
            getTeamData();
        }
    });

    document.getElementById('raw-match-number-input').addEventListener('change', function (e) {
        let desiredMatch = parseInt(document.getElementById('raw-match-number-input').value);
        let matchNumberColumnIndex = FIELDS.indexOf('Match Number');
        let column = document.getElementsByClassName('column')[matchNumberColumnIndex];

        for (let i = 1; i < column.children.length; i++) {
            if (parseInt(column.children[i].innerText) == desiredMatch) {
                column.children[i].scrollIntoView({
                    block: 'center',
                    behavior: 'smooth' // Optional for smooth scrolling
                });
                setRowHighlight(i - 1, true);
                return;
            }
        }
    });

    // Resets sort direction & column
    localStorage.setItem("direction", 0);
    localStorage.setItem("column", -1);

    for (let h = 0; h < FIELDS.length; h++) {
        // Temp column
        let col = document.createElement("div");
        // Temp header
        let tempHeader = document.createElement("div");

        // Temp header text
        let tempHeaderText = document.createElement("h3");
        tempHeaderText.innerText = FIELDS[h];
        tempHeader.appendChild(tempHeaderText);
        tempHeader.className = "table-header-section-raw";

        // Sets data type to first character in the first row of desired column,
        // used to see if data can be sorted numerically 
        let dataType = 1;
        if (RECORDS.length > 0) {
            dataType = new String(RECORDS[0][h]).substring(0, 1);
        }
        // Stores the data type as the header id 
        // TODO there is probably a more stable and better way to do this
        tempHeader.id = dataType;
        tempHeader.dataset.dataType = dataType;
        // Adds column number to header class list
        tempHeader.classList.add(`${(h)}`);
        // FIXME Sorts the column, passes column number, if it's numerical, records, columns, fields, idk what else
        tempHeader.onclick = function () { sortColumn(this.classList[1], detectCharacter(this.id), RECORDS, COLUMNS, FIELDS, false, true) };

        col.className = "column";
        col.appendChild(tempHeader);
        rawTable.appendChild(col);
    }

    for (let i = 0; i < RECORDS.length; i++) {
        if (parseInt(RECORDS[i][TEAM_INDEX]) != parseInt(team)) {
            continue;
        }
        for (let s = 0; s < RECORDS[i].length; s++) {


            // Temp data value html element
            let tempDataValue = document.createElement("div");
            tempDataValue.className = "data-value";
            tempDataValue.id = i;
            // Adds the nice norizontal stripes, easier to read
            if (i % 3 == 0) {
                tempDataValue.style.backgroundColor = "#302f2b";
            }

            // Special cases where clicking does another behavior, such as opening comments section
            if (FIELDS[s].includes("Comments") || FIELDS[s].includes("Human Player Notes")) {
                tempDataValue.innerText = "{ View }";
                tempDataValue.id = i;
                tempDataValue.classList.add(s);
                tempDataValue.onclick = function () { showCommentModal(RECORDS[this.id][this.classList[1]]) }
                tempDataValue.addEventListener("click", function () {
                    setRowHighlight(this.id, true);
                });
            } else {
                // Otherwise highlight the correct row
                tempDataValue.innerText = RECORDS[i][s];
                // id is the row the cell is in
                tempDataValue.addEventListener("click", function () {
                    setRowHighlight(this.id, false);
                });
            }
            rawTable.children[s + 1].appendChild(tempDataValue);
        }
    }
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

function setUpGraph() {
    graphContainer.innerHTML = "";

    if (TEAM_ROWS.length < 1) {
        getTeamData();
    }

    let tempSelectContainer = document.createElement("div");
    tempSelectContainer.style.width = "fit-content";
    tempSelectContainer.style.padding = "2vh";
    tempSelectContainer.style.display = "flex";
    tempSelectContainer.style.backgroundColor = '#303030';

    //graphContainer.innerHTML = "";
    graphContainer.style.display = "flex";
    rawTable.innerHTML = "";

    let tempTwo = document.createElement("select");
    tempTwo.id = "graph-category-select-two";
    tempTwo.addEventListener("input", doGraph);
    tempTwo.style.width = "30vh";
    tempTwo.style.marginRight = "5vh";
    for (let i = 1; i < TEAM_FIELDS.length; i++) {
        let op = document.createElement("option");
        op.text = TEAM_FIELDS[i];
        op.value = i;
        tempTwo.append(op);
    }
    if (localStorage.getItem("graph-two") != null) {
        tempTwo.value = localStorage.getItem("graph-two");
    }
    tempSelectContainer.appendChild(tempTwo);

    let tempTeamSelect = document.createElement("select");
    tempTeamSelect.id = "graph-category-select-team";
    tempTeamSelect.addEventListener("input", doGraph);
    tempTeamSelect.style.width = "15vh";
    tempTeamSelect.style.marginRight = "5vh";
    for (let i = 0; i < TEAMS.length; i++) {
        let op = document.createElement("option");
        op.text = TEAMS[i];
        op.value = TEAMS[i];
        tempTeamSelect.append(op);
    }
    if (localStorage.getItem("graph-team") != null) {
        tempTeamSelect.value = localStorage.getItem("graph-team");
    }
    tempSelectContainer.appendChild(tempTeamSelect);

    let temp = document.createElement("select");
    temp.id = "graph-number-select";
    temp.style.width = "25vh";
    for (let i = 0; i < 3; i++) {
        let op = document.createElement("option");
        if (i == 0) {
            op.text = i + 1 + " Value";
        } else if (i == 1) {
            op.text = i + 1 + " Values";
        } else if (i == 2) {
            op.text = "Consistency Line"
        } else if (i == 3) {
            op.text = "Consistency Matrix"
        }
        op.value = i + 1;
        temp.append(op);
    }

    if (localStorage.getItem("graph-mode") != null) {
        temp.value = localStorage.getItem("graph-mode");
    }

    temp.addEventListener("input", doGraph);
    tempSelectContainer.appendChild(temp);

    var tempT = document.createElement("select");
    tempT.id = "graph-category-select";
    tempT.addEventListener("input", doGraph);
    tempT.style.width = "30vh";
    tempT.style.marginLeft = "5vh";
    for (var i = 1; i < TEAM_FIELDS.length; i++) {
        var op = document.createElement("option");
        op.text = TEAM_FIELDS[i];
        op.value = i;
        tempT.append(op);
    }
    tempSelectContainer.appendChild(tempT);

    if (localStorage.getItem("graph-one") != null) {
        tempT.value = localStorage.getItem("graph-one");
    }

    graphContainer.appendChild(tempSelectContainer);

    let tempGraphCanvasContainer = document.createElement("div");
    tempGraphCanvasContainer.id = "graph-canvas-container";

    let tempGraphCanvas = document.createElement("canvas");
    tempGraphCanvas.id = "graph-canvas";
    tempGraphCanvasContainer.appendChild(tempGraphCanvas)

    graphContainer.appendChild(tempGraphCanvasContainer);

    rawTable.appendChild(graphContainer);

    doGraph();
}

function doGraph() {

    if (graphTabGraph != null) {
        graphTabGraph.destroy();
    }

    var graphCanvas = document.getElementById("graph-canvas");

    var graphMode = parseInt(document.getElementById("graph-number-select").value);

    document.getElementById("graph-category-select-team").style.display = "none";
    document.getElementById("graph-category-select-two").style.display = "none";

    // Column to look at
    var graphColumn = document.getElementById("graph-category-select").value;

    // Sorted column
    var sortedGraphColumn = JSON.parse(JSON.stringify(TEAM_COLUMNS));

    switch (graphMode) {
        case 1:
            document.getElementById("graph-category-select").style.display = "block";
            sortedGraphColumn = sortedGraphColumn[graphColumn].sort(function (a, b) { return a - b });

            // Sorted teams
            var teamsSorted = [];
            console.log(TEAM_ROWS)
            for (let i = 0; i < sortedGraphColumn.length; i++) {
                for (let t = 0; t < TEAM_ROWS.length; t++) {
                    if (TEAM_ROWS[t][graphColumn] == sortedGraphColumn[i] && !teamsSorted.includes(TEAM_ROWS[t][0])) {
                        teamsSorted.push(TEAM_ROWS[t][0]);
                        console.log(i);
                        break;
                    }
                }
            }
            graphTabGraph = showBarGraph(graphCanvas, sortedGraphColumn, teamsSorted, TEAM_FIELDS[graphColumn]);
            break;
        case 2:
            document.getElementById("graph-category-select-two").style.display = "block";
            document.getElementById("graph-category-select").style.display = "block";
            var secondGraphColumn = document.getElementById("graph-category-select-two").value;
            let secondSortedGraphColumn = JSON.parse(JSON.stringify(TEAM_COLUMNS));
            secondSortedGraphColumn = secondSortedGraphColumn[secondGraphColumn];

            sortedGraphColumn = sortedGraphColumn[graphColumn]

            var teamData2d = [];
            for (let i = 0; i < secondSortedGraphColumn.length; i++) {
                teamData2d.push({
                    team: TEAMS[i],
                    x: sortedGraphColumn[i],
                    y: secondSortedGraphColumn[i]
                });
            }
            graphTabGraph = showScatterChart(graphCanvas, teamData2d, [TEAM_FIELDS[graphColumn], TEAM_FIELDS[secondGraphColumn]]);
            break;
        case 4:
            document.getElementById("graph-category-select").style.display = "none";
            document.getElementById("graph-category-select-team").style.display = "block";
            let tempData = [];
            let tempTeamRows = [];

            let selectedTeam = document.getElementById("graph-category-select-team").value;
            let matchesSorted = [];

            for (let i = 0; i < RECORDS.length; i++) {
                if (parseInt(RECORDS[i][0]) == parseInt(selectedTeam)) {
                    // Filters to only numerical data
                    let filteredRecord = [];
                    for (let f = 0; f < RECORDS[i].length; f++) {
                        if (detectCharacter(new String(RECORDS[i][f]).substring(0, 1)) == 1) {
                            filteredRecord.push(RECORDS[i][f]);
                        }
                    }
                    tempTeamRows.push(filteredRecord);
                    // TODO: CHANGE TO MATCH NUMBER COLUMN IN 2024
                    matchesSorted.push(RECORDS[i][2]);
                }
            }
            matchesSorted = matchesSorted.sort(function (a, b) { return a - b });

            let sortedTeamRows = [];

            for (let i = 0; i < matchesSorted.length; i++) {
                for (let c = 0; c < tempTeamRows.length; c++) {
                    // TODO: CHANGE TO MATCH NUMBER COLUMN IN 2024
                    if (tempTeamRows[c][1] == matchesSorted[i]) {
                        sortedTeamRows.push(tempTeamRows[c]);
                        tempTeamRows.splice(c, 1);
                        c--;
                        break;
                    }
                }
            }

            // FIXME fix this embarassing nonesense sad excuse of a function

            // Now remove match numbers
            // Spagetti code im tired :(
            for (let i = 0; i < sortedTeamRows.length; i++) {
                // FIXME guess what is it
                // It's what all the other ones say
                // TODO ChAnGe To MaTcH nUmBeR cOlUmN iN 2024 -_-
                sortedTeamRows[i].splice(0, 2);
            }

            let formattedData = [];
            let includedFields = JSON.parse(JSON.stringify(TEAM_FIELDS));

            // Remove team number field, not needed
            includedFields.splice(0, 1);

            // NOW sort every data element & check indicies
            let indicies = [];

            // Now make some columns
            let tempSortedColumns = [];
            for (let c = 0; c < sortedTeamRows[0].length; c++) {
                let tempArray = [];
                for (let i = 0; i < sortedTeamRows.length; i++) {
                    tempArray.push(sortedTeamRows[i][c]);
                }
                tempSortedColumns.push(tempArray);
            }

            for (let i = 0; i < tempSortedColumns.length; i++) {
                let tempSortedRow = tempSortedColumns[i].toSorted((a, b) => a - b);
                let tempIndicies = [];
                for (let c = 0; c < tempSortedColumns[i].length; c++) {
                    // Special case, don't divide by 0 & make it bright if it's the only one
                    if (tempSortedRow.length != 0 && tempSortedRow.length != 1) {
                        tempIndicies.push(tempSortedRow.indexOf(tempSortedColumns[i][c]) / (tempSortedRow.length - 1));
                    } else {
                        tempIndicies.push(1);
                    }
                }
                indicies.push(tempIndicies);
            }

            // NO WAY this disaster of a function actually works :0 now time to document & clean it up
            // But first mason needs sleep

            for (let i = 0; i < sortedTeamRows.length; i++) {
                for (let c = 0; c < sortedTeamRows[0].length; c++) {
                    formattedData.push({
                        x: matchesSorted[i],
                        y: includedFields[c],
                        v: sortedTeamRows[i][c],
                        index: indicies[c][i]
                    });
                }
            }

            // FIXME remove so many nested for-loops but at least most of them are O(1)

            console.log(sortedTeamRows);

            // FIXME
            // TODO Add in the color-coding, probably just sort each row & pass an array of indexes into function
            graphTabGraph = showMatrixGraph(graphCanvas, formattedData, matchesSorted, includedFields, "Description");
            break;
        case 3:
            let teamSelect = document.getElementById("graph-category-select-team");
            let valueSelect = document.getElementById("graph-category-select");

            valueSelect.style.display = "block";
            teamSelect.style.display = "block";

            let matches = [];
            let teamFields = [];

            for (let i = 0; i < RECORDS.length; i++) {
                if (parseInt(RECORDS[i][0]) == parseInt(teamSelect.value) && !matches.includes(RECORDS[i][2])) {
                    matches.push(parseInt(RECORDS[i][2]));
                    teamFields.push(RECORDS[i][FIELDS.indexOf(TEAM_FIELDS[parseInt(valueSelect.value)])]);
                }
            }

            graphTabGraph = showConsistencyLineGraph(graphCanvas, matches, teamFields, [teamSelect.value]);
            break;
        default:
            console.error("Invalid graph mode :(");
            break;
    }

    localStorage.setItem("graph-mode", document.getElementById("graph-number-select").value);
    localStorage.setItem("graph-one", document.getElementById("graph-category-select").value);
    localStorage.setItem("graph-two", document.getElementById("graph-category-select-two").value);
    localStorage.setItem("graph-team", document.getElementById("graph-category-select-team").value);
}

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
function sortColumn(colNum, type, records, columns, field, team, useCols) {
    var direction = parseInt(localStorage.getItem("direction"));
    var previousColumn = parseInt(localStorage.getItem("column"));
    // set headers to color, then highlight current one
    let tempHeaders = document.getElementsByClassName("table-header-section-raw");
    for (let headerNum = 0; headerNum < tempHeaders.length; headerNum++) {
        tempHeaders[headerNum].style.backgroundColor = "#333333";
    }
    tempHeaders[colNum].style.backgroundColor = "#995303";

    localStorage.setItem("column", colNum);
    localStorage.setItem("direction", parseInt(direction) + 1);
    if (previousColumn != colNum) {
        direction = 0;
        localStorage.setItem("direction", 1);
    }

    let root = document.querySelector(":root");

    if (useCols) {
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
    }

    if (type == 1) {
        var sortedColumn = JSON.parse(JSON.stringify(columns));
        //console.log(dir);
        if (direction % 3 == 1) {
            sortedColumn = sortedColumn[colNum].sort(function (a, b) { return a - b });
        } else if (direction % 3 == 0) {
            sortedColumn = sortedColumn[colNum].sort(function (a, b) { return b - a });
        } else {
            //console.log(team);
            if (team) {
                getTeamData();
            } else {
                resetRaw();
            }
            //originalSort(records, columns, field);
            return;
        }

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

        //console.log(sortedColumn);

        var cols = document.getElementsByClassName("column");
        for (var i = 0; i < records.length; i++) {
            var sub = 0;
            if (team) {
                sub = 1;
            }
            for (var s = 0; s < records[i].length - sub; s++) {
                //console.log(RECORDS[i][s]);
                var tempCol = cols[s];
                var temp = tempCol.children[i + 1];
                if (team) {
                    temp.classList[1] = i;
                }

                if (field[s].includes("Comments") || FIELDS[s].includes("Human Player Notes")) {
                    temp.innerText = "{ View }";
                    temp.id = i;
                    temp.classList.add(s);
                    temp.onclick = function () { showCommentModal(sortedRows[this.id][this.classList[1]]) }
                    temp.addEventListener("click", function () {
                        setRowHighlight(this.id, true);
                    });
                } else {
                    if (team) {
                        if (s == 0) {
                            for (var q = 0; q < sortedRows.length; q++) {
                                if (sortedRows[i][0] == TEAMS[q]) {
                                    temp.id = q;
                                }
                            }
                        }
                    }
                    temp.innerText = sortedRows[i][s];
                }
                temp.style.boxShadow = '';
            }
        }
        // This code is a mess

        if (team) {
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

    } else {
        // Uh oh it's not a number :(
        console.error("Sad");
    }
}

function detectCharacter(val) {
    //console.log(val);
    return (val == "0" || val == "1" || val == "2" || val == "3" || val == "4" || val == "5" || val == "6" || val == "7" || val == "8" || val == "9") ? 1 : 0;
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

function refreshData() {
    rawTable.innerHTML = "";
    getData();
}

function getTeamData() {
    // Hide all other tabs, resets arrays
    graphContainer.style.display = "none";

    rawTable.innerHTML = "";
    TEAM_COLUMNS = [];
    TEAM_ROWS = [];
    TEAM_FIELDS = [];

    let tableHeaderContainer = document.createElement('div');
    tableHeaderContainer.id = 'table-header-container';
    tableHeaderContainer.innerHTML = `<select id='table-type-select' value='raw'><option value="team" selected>Team Data</option><option value="raw">Raw Data</option></select>`;
    rawTable.appendChild(tableHeaderContainer);

    document.getElementById('table-type-select').addEventListener('change', function (e) {
        if (document.getElementById('table-type-select').value == 'raw') {
            resetRaw();
        }
    });

    // Updates array of teams
    getTeamList();

    // Data that is numerical & will be included in team data grid
    let dataToKeep = [];

    // Iterate through all fields, if the data is numerical, add field index to dataToKeep array
    for (let i = 0; i < FIELDS.length; i++) {
        let dataType = 1;
        if (RECORDS.length > 0) {
            dataType = new String(RECORDS[0][i]).substring(0, 1);
        }
        // Special case is match number, that would obviously be useless to round & use haha
        if (teamDataToKeep.includes(FIELDS[i])) {
            dataToKeep.push(i - 1);
            TEAM_FIELDS.push(FIELDS[i]);
        }
    }

    // Iterates through all fields (columns), creates field headers & columns
    for (let i = 0; i < dataToKeep.length; i++) {
        // Creates column html element
        let tempColumn = document.createElement("div");
        tempColumn.className = "column";

        // Temp header html element
        let tempHeader = document.createElement("div");

        let text = document.createElement("h3");
        text.innerText = FIELDS[dataToKeep[i] + 1];
        tempHeader.appendChild(text);
        tempHeader.className = "table-header-section-raw";
        tempHeader.classList.add(`${(i)}`);
        tempColumn.appendChild(tempHeader);

        rawTable.appendChild(tempColumn);
    }
    // Where in the world did I set the highlight I'm falling asleep :(

    // Creates new 2d arrays
    for (let g = 0; g < dataToKeep.length + 1; g++) {
        TEAM_COLUMNS[g] = new Array();
    }

    // Iterates through every team (basically makes each row)
    for (let i = 0; i < TEAMS.length; i++) {
        TEAM_ROWS[i] = new Array();

        // List of every row of raw data for team
        let teamRows = [];

        // If the record team equals current team, add the raw data row index to array
        for (let t = 0; t < RECORDS.length; t++) {
            if (RECORDS[t][TEAM_INDEX] == TEAMS[i]) {
                teamRows.push(t);
            }
        }

        // Iterates through every column
        for (let c = 0; c < dataToKeep.length; c++) {
            // Average for the current column/field
            let average = 0;

            // Adds all of the team's rows in current column together, so we can everage it later
            for (let r = 0; r < teamRows.length; r++) {
                average += parseInt(RECORDS[teamRows[r]][dataToKeep[c] + 1]);
            }

            // Temp data value html element
            let tempData = document.createElement("div");
            tempData.className = "data-value";
            tempData.classList.add(i);
            tempData.id = i;

            // Averages each data value, sets the text
            average = Math.floor(average / teamRows.length * 10) / 10;
            tempData.innerText = average;

            // If it's the team data value, then show comment modal on click, otherwise just do normal highlight toggle
            if (c == 0) {
                tempData.addEventListener("click", function () {
                    // Always highlight, so it's easy to see what team you clicked on
                    setTeamRowHighlight(parseInt(this.classList[1]), true);
                    showCommentModal(TEAM_ROWS[this.id][TEAM_COLUMNS.length - 1]);
                });
            } else {
                tempData.addEventListener("click", function () {
                    // Toggle highlight
                    setTeamRowHighlight(parseInt(this.classList[1]), false);
                });
            }

            // Adds row stripes
            if ((i) % 3 == 0) {
                tempData.style.backgroundColor = "#302f2b";
            }

            rawTable.children[c + 1].appendChild(tempData);

            // Average out the data
            TEAM_COLUMNS[c][i] = average;
            TEAM_ROWS[i][c] = average;
        }

        // Temp comment text
        let tempComment = "";

        for (let q = 0; q < RECORDS.length; q++) {
            // Find all comments for current team, add to variable
            if (RECORDS[q][TEAM_INDEX] == TEAMS[i]) {
                tempComment += "Q" + RECORDS[q][2] + ":   " + RECORDS[q][FIELDS.indexOf("Comments")] + "\n\n";
            }
        }

        // Add comment text to correct position
        TEAM_ROWS[i].push(tempComment);
        TEAM_COLUMNS[dataToKeep.length].push(tempComment);
    }

    if (highlightTeamData) {
        let columnCopy = JSON.parse(JSON.stringify(TEAM_COLUMNS));
        for (let c = 0; c < TEAM_COLUMNS.length - 1; c++) {
            let cols = document.getElementsByClassName("column")[c];

            let filteredColumn = [...new Set(columnCopy[c].sort((a, b) => a - b))];
            console.log(filteredColumn);
            for (let i = 0; i < TEAM_COLUMNS[c].length; i++) {
                let color = filteredColumn.indexOf(TEAM_COLUMNS[c][i]) / (filteredColumn.length - 1);
                cols.children[i + 1].style.boxShadow = `0px 0px 0px 100vh inset rgba(${(1 - color) * 255}, ${color * 255}, 0, ${Math.pow(Math.abs(color - 0.5) * 1.85, 2)})`;
            }
        }
    }

    // Adds click listeners to each header
    for (let i = 0; i < dataToKeep.length; i++) {
        document.getElementsByClassName("column")[i].children[0].onclick = function () {
            sortColumn(this.classList[1], detectCharacter(1), TEAM_ROWS, TEAM_COLUMNS, TEAM_FIELDS, true, true);
        };
    }

    // Sets highlight to what it was before
    if (localStorage.getItem("previousHighlightRow") != -1) {
        setRowHighlight(parseInt(localStorage.getItem("previousHighlightRow")), true);
    }
}

// Helper function, updates list of teams
function getTeamList() {
    TEAMS = [];

    for (let i = 0; i < RECORDS.length; i++) {
        if (!TEAMS.includes(RECORDS[i][TEAM_INDEX]) && RECORDS[i][TEAM_INDEX] != null && RECORDS[i][TEAM_INDEX] != "?") {
            TEAMS.push(RECORDS[i][TEAM_INDEX]);
        }
    }

    // Sorts teams by ascending number
    TEAMS.sort((a, b) => a - b);
    //console.log(TEAMS);
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

function setColorScheme() {
    let root = document.querySelector(":root");
    if (DARK_COLOR_SCHEME) {
        //root.style.setProperty("--bg-color", "rgb(10, 10, 10)");
        //root.style.setProperty("--data-table", "rgb(19, 19, 19)");
    } else {
        //root.style.setProperty("--bg-color", "rgb(235, 235, 235)");
        //root.style.setProperty("--data-table", "rgb(210, 210, 210)");
    }
}

function estimateCycleTimes(team) {

    if (team == -1 || team == '-1') {
        return;
    }

    let teamMatches = TEAM_MATCHES[TEAMS.indexOf(parseInt(team))];

    let algaeTimes = [];
    let coralTimes = [];

    for (let f = 0; f < teamMatches.length - 1; f++) {
        for (let s = f + 1; s < teamMatches.length; s++) {
            let firstAlgaeTele = teamMatches[f][FIELDS.indexOf('Tele Net')] + (0.5 * teamMatches[f][FIELDS.indexOf('Tele Processor')]) + (0.2 * teamMatches[f][FIELDS.indexOf('Tele Algae Removed')]);
            let secondAlgaeTele = teamMatches[s][FIELDS.indexOf('Tele Net')] + (0.5 * teamMatches[s][FIELDS.indexOf('Tele Processor')]) + (0.2 * teamMatches[s][FIELDS.indexOf('Tele Algae Removed')]);

            let firstCoralTele = (teamMatches[f][FIELDS.indexOf('Tele L4')] * 1.15) + (1 * teamMatches[f][FIELDS.indexOf('Tele L3')]) + (1 * teamMatches[f][FIELDS.indexOf('Tele L2')]) + (0.9 * teamMatches[f][FIELDS.indexOf('Tele L1')]);
            let secondCoralTele = (teamMatches[s][FIELDS.indexOf('Tele L4')] * 1.15) + (1 * teamMatches[s][FIELDS.indexOf('Tele L3')]) + (1 * teamMatches[s][FIELDS.indexOf('Tele L2')]) + (0.9 * teamMatches[f][FIELDS.indexOf('Tele L1')]);

            let firstMatchTime = 133;
            let secondMatchTime = 133;

            if (teamMatches[f][FIELDS.indexOf('Shallow Climb')] == 'Yes' || teamMatches[f][FIELDS.indexOf('Deep Climb')] == 'Yes') {
                firstMatchTime = 128;
            }

            if (teamMatches[s][FIELDS.indexOf('Shallow Climb')] == 'Yes' || teamMatches[s][FIELDS.indexOf('Deep Climb')] == 'Yes') {
                secondMatchTime = 128;
            }

            if ((firstAlgaeTele == 0 && firstCoralTele == 0) || (secondAlgaeTele == 0 && secondCoralTele == 0)) {
                continue;
            }

            if (firstAlgaeTele / firstCoralTele == secondAlgaeTele / secondCoralTele) {
                continue;
            }

            // Defining the coefficients matrix and constants vector
            let coefficients = [
                [firstAlgaeTele, firstCoralTele],
                [secondAlgaeTele, secondCoralTele]
            ];
            let constants = [firstMatchTime, secondMatchTime];

            console.log(coefficients)

            let solutions = math.lusolve(coefficients, constants);

            let estimatedAlgaeTime = solutions[0][0];
            let estimatedCoralTime = solutions[1][0];

            algaeTimes.push(estimatedAlgaeTime);
            coralTimes.push(estimatedCoralTime);

        }
    }

    algaeTimes.sort(function (a, b) {
        return a - b;
    });

    coralTimes.sort(function (a, b) {
        return a - b;
    });

    let medianAlgaeTime = algaeTimes[Math.floor(algaeTimes.length / 2)];
    let medianCoralTime = coralTimes[Math.floor(coralTimes.length / 2)];

    return [medianAlgaeTime, medianCoralTime];
}