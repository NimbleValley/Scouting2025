// Sets up breakdown tab, only runs on first click
function setUpTeamBreakdowns() {

    // Reset stuff
    graphContainer.style.display = "none";
    pickListContainer.style.display = "none";
    breakdownGrid.style.display = "grid";

    breakdownLines.innerHTML = "";
    rawTable.innerHTML = "";
    breakdownGrid.innerHTML = "";

    // Creates the team select html element
    let tempTeamSelect = document.createElement("select");
    tempTeamSelect.id = "team-breakdown-select";
    tempTeamSelect.addEventListener("input", openTeamBreakdowns);

    // Creates & adds every team to the select
    for (let i = 0; i < TEAMS.length; i++) {
        let op = document.createElement("option");
        op.text = TEAMS[i];
        op.value = TEAMS[i];
        tempTeamSelect.append(op);
    }

    // If there was a previously selected team select them
    if (localStorage.getItem("breakdown-team") != null) {
        tempTeamSelect.value = localStorage.getItem("breakdown-team");
    }

    // Creates all breakdown line graph things
    for (let i = 0; i < breakdownCategoryHeaders.length; i++) {

        // Parent Container for each line
        let tempContainer = document.createElement("div");
        tempContainer.className = "line-container";

        // Line container
        let tempLine = document.createElement("div");
        tempLine.className = "breakdown-line";

        // The thing that pops up when you hover over the line 
        let tempPopup = document.createElement("div");
        tempPopup.className = "breakdown-popup";
        tempContainer.appendChild(tempPopup);

        // Actual line element
        let tempInnerLine = document.createElement("div");
        tempInnerLine.className = "inner-breakdown-line";
        tempInnerLine.style.height = `0 % `;

        // Label for 
        let temph4 = document.createElement("h4");
        temph4.innerText = breakdownCategoryHeaders[i];

        // Add them all to the correct container/s
        tempLine.appendChild(tempInnerLine);
        tempContainer.appendChild(tempLine);
        tempContainer.appendChild(temph4);
        breakdownLines.appendChild(tempContainer);
    }

    // Top bar that shows team statistics
    let breakdownData = document.createElement("div");
    breakdownData.id = "breakdown-data-container";

    // Container for issues, comments, auto, etc.
    let feedbackContainer = document.createElement("div");
    feedbackContainer.id = "feedback-container";

    breakdownGrid.appendChild(tempTeamSelect);
    breakdownGrid.appendChild(breakdownData);
    breakdownGrid.appendChild(breakdownLines);
    breakdownGrid.appendChild(feedbackContainer);
    document.body.appendChild(breakdownGrid);
}

// Runs team breakdowns
async function openTeamBreakdowns() {
    // If there is no team data, then get team data
    if (TEAM_COLUMNS.length < 1) {
        getTeamData();
    }

    // FIXME idk if firstBreakdown is even needed
    // Bad way to do this but if it's the first time then run setUpTeamBreakdowns
    if (firstbreakdown) {
        setUpTeamBreakdowns();
        firstbreakdown = false;
    }

    breakdownLines.style.display = "flex";
    graphContainer.style.display = "none";
    pickListContainer.style.display = "none";

    // Stores the percentiles for the given team, 0-1
    let breakdownData = [];

    localStorage.setItem("breakdown-team", document.getElementById("team-breakdown-select").value);

    // Iterates through every breakdown category
    for (let i = 0; i < breakdownCategoryHeaders.length; i++) {
        // 2d array, array of teams sorted in each cetegory
        let teamsSorted = [];
        for (let t = 0; t < getSortedIndex(sortIndexes[i], TEAM_ROWS, TEAM_COLUMNS).length; t++) {
            // Adds the orders to array
            teamsSorted[t] = getSortedIndex(sortIndexes[i], TEAM_ROWS, TEAM_COLUMNS)[t][0];
        }

        // Sort the column, return the index that was matched up with the data
        // Decimal 0-1, 1 being they had the highest, 0 the lowest
        breakdownData[i] = teamsSorted.indexOf(parseInt(document.getElementById("team-breakdown-select").value)) / parseFloat(TEAMS.length - 1);
    }

    // Iterates through lines & sets each line to correct height based on breakdownData
    for (let i = 0; i < breakdownCategoryHeaders.length; i++) {
        document.getElementsByClassName("inner-breakdown-line")[i].style.height = `${breakdownData[i] * 100}% `;
        document.getElementsByClassName("breakdown-popup")[i].innerText = `${(breakdownData[i] * (TEAMS.length - 1)) + 1} out of ${TEAMS.length} `;
    }

    // Container for the top values displayed in breakdowns
    let breakdownDataContainer = document.getElementById("breakdown-data-container");
    breakdownDataContainer.innerHTML = "";

    // Iterates through each column, but skips team number
    for (let i = 1; i < TEAM_COLUMNS.length - 1; i++) {
        if (TEAM_FIELDS[i] == "Auto Piece Selection") {
            continue;
        }

        // Rectangular container
        let tempDataContainer = document.createElement("div");
        tempDataContainer.className = "breakdown-data";

        // Text element, holds data
        let tempData = document.createElement("h8");
        tempData.innerText = TEAM_ROWS[TEAMS.indexOf(parseInt(document.getElementById("team-breakdown-select").value))][i];

        // Text element, holds team number
        let tempDataTitle = document.createElement("h9");
        tempDataTitle.innerText = TEAM_FIELDS[i];

        tempDataContainer.appendChild(tempDataTitle);
        tempDataContainer.appendChild(tempData);
        breakdownDataContainer.appendChild(tempDataContainer);
    }

    // Container for issues, autos, comments, etc.
    let tempFeedbackContainer = document.getElementById("feedback-container");
    tempFeedbackContainer.innerHTML = "";

    let currentTeam = parseInt(document.getElementById("team-breakdown-select").value);

    // All of current team's rows
    let tempTeamRows = [];
    for (let i = 0; i < RECORDS.length; i++) {
        if (parseInt(RECORDS[i][0]) == currentTeam) {
            tempTeamRows.push(RECORDS[i]);
        }
    }

    let tempPercentGraphContainer = document.createElement("div");
    tempPercentGraphContainer.id = "breakdown-percentages-container";

    // Team's matches, pickups
    let tempTeamMatches = [];
    let tempTeamAutoPickups = [];

    // Auto speaker
    let tempAutoSpeakerTotal = 0;
    let tempAutoSpeakerMade = 0;

    // Tele speaker
    let tempTeleSpeakerTotal = 0;
    let tempTeleSpeakerMade = 0;
    for (let i = 0; i < tempTeamRows.length; i++) {
        tempAutoSpeakerTotal += parseInt(tempTeamRows[i][8] + tempTeamRows[i][9]);
        tempAutoSpeakerMade += parseInt(tempTeamRows[i][8]);
        tempTeamMatches.push(parseInt(tempTeamRows[i][2]));
        tempTeamAutoPickups.push(tempTeamRows[i][14]);

        tempTeleSpeakerTotal += parseInt(tempTeamRows[i][16] + tempTeamRows[i][17]);
        tempTeleSpeakerMade += parseInt(tempTeamRows[i][16]);
    }
    tempPercentGraphContainer.appendChild(getBreakdownPercentPie("Auto Speaker", tempAutoSpeakerTotal, tempAutoSpeakerMade));
    tempPercentGraphContainer.appendChild(getBreakdownPercentPie("Tele Speaker", tempTeleSpeakerTotal, tempTeleSpeakerMade));

    let tempTrapTotal = 0;
    let tempTrapMade = 0;
    for (let i = 0; i < tempTeamRows.length; i++) {
        if (tempTeamRows[i][22] == "Successful") {
            tempTrapTotal++;
            tempTrapMade++;
        } else if (tempTeamRows[i][22] == "Failed") {
            tempTrapTotal++;
        }
    }
    tempPercentGraphContainer.appendChild(getBreakdownPercentPie("Trap", tempTrapTotal, tempTrapMade));

    let tempClimbTotal = 0;
    let tempClimbMade = 0;
    for (let i = 0; i < tempTeamRows.length; i++) {
        if (tempTeamRows[i][21] == "Successful") {
            tempClimbTotal++;
            tempClimbMade++;
        } else if (tempTeamRows[i][21] == "Failed") {
            tempClimbTotal++;
        }
    }
    tempPercentGraphContainer.appendChild(getBreakdownPercentPie("Climb", tempClimbTotal, tempClimbMade));

    tempFeedbackContainer.appendChild(tempPercentGraphContainer);

    // Container for warnings, child of feedback container
    let tempWarningContainer = document.createElement("div");
    tempWarningContainer.id = "breakdown-warning-container";

    // Title
    let tempWarningTitle = document.createElement("p");
    tempWarningTitle.className = "breakdown-warning-text";
    tempWarningTitle.style.fontWeight = "bold";
    tempWarningTitle.style.scale = "1.5";
    tempWarningTitle.style.textDecoration = "underline";
    tempWarningTitle.innerText = "Issues:";
    tempWarningContainer.appendChild(tempWarningTitle);

    // 2d array of all team warning arrays
    let compiledWarnings = [TEAMS_FLIPPED, TEAMS_COMMS, TEAMS_DISABLED, TEAMS_DUMB, TEAMS_RECKLESS];

    // Goes through each warning type
    for (let w = 0; w < warningTypes.length; w++) {
        // By default, create new text element with 0 of current warning
        let tempWarningText = document.createElement("p");
        tempWarningText.className = "breakdown-warning-text";
        tempWarningText.innerText = "0 " + warningTypes[w];

        // Check if the team is in the current warning array
        if (compiledWarnings[w].includes(parseInt(document.getElementById("team-breakdown-select").value))) {
            // Uh oh they are, check how many times they are in this array
            let numOccurances = 0;
            for (let charlotteCovert = 0; charlotteCovert < compiledWarnings[w].length; charlotteCovert++) {
                if (compiledWarnings[w][charlotteCovert] == parseInt(document.getElementById("team-breakdown-select").value)) {
                    numOccurances++;
                }
            }
            // Now set the text to show how many times they have the issue
            tempWarningText.innerText = numOccurances + " " + warningTypes[w];
        }
        // Then add it to the correct container
        tempWarningContainer.appendChild(tempWarningText);
    }

    tempFeedbackContainer.appendChild(tempWarningContainer);

    // Auto container
    let tempAutoContainer = document.createElement("div");
    tempAutoContainer.id = "breakdown-auto-container";

    // Canvas for auto pie chart
    let autoPie = document.createElement("canvas");
    autoPie.id = "auto-pie-chart";
    tempAutoContainer.appendChild(autoPie);

    let tempAutoFloorContainer = document.createElement("div");
    tempAutoFloorContainer.id = "breakdown-auto-floor-container";



    // Auto floor section, includes select & field top-down image
    let tempFloorContainer = document.createElement("div");
    tempFloorContainer.id = "auto-floor-container";

    // Background image & notes
    let tempFloorImageContainer = document.createElement("div");
    tempFloorImageContainer.id = "floor-image-container";
    tempFloorImageContainer.style.backgroundImage = `url(img/${tempTeamRows[0][1].substring(0, 1) == "B" ? "blue" : "red"}field24.jpg)`;

    // Add notes in, two containers, one with 3 & one with 5
    let upperNoteContainer = document.createElement("div");
    upperNoteContainer.className = "horizontal-note-container";
    tempFloorImageContainer.appendChild(upperNoteContainer);

    // Lower, 3 notes
    let lowerNoteContainer = document.createElement("div");
    lowerNoteContainer.className = "horizontal-note-container";
    lowerNoteContainer.style.width = "55%";
    lowerNoteContainer.style.marginLeft = "5%";
    tempFloorImageContainer.appendChild(lowerNoteContainer);

    let tempTempNotes = [];
    // Add notes to upper container
    for (let i = 0; i < 5; i++) {
        let tempNote = document.createElement("div");
        tempNote.className = "breakdown-floor-note";
        tempNote.id = i;

        upperNoteContainer.appendChild(tempNote);

        tempTempNotes.push(tempNote);
    }

    // If the field is red, alter styling to mirror
    if (tempTeamRows[0][1].substring(0, 1) == "R") {
        upperNoteContainer.style.scale = -1;
        lowerNoteContainer.style.scale = -1;
        lowerNoteContainer.style.marginLeft = "40%";
    }

    // Add notes to lower container
    for (let i = 0; i < 3; i++) {
        let tempNote = document.createElement("div");
        tempNote.className = "breakdown-floor-note";

        tempNote.id = i + 5;

        lowerNoteContainer.appendChild(tempNote);

        tempTempNotes.push(tempNote);
    }

    console.log(tempTeamAutoPickups);
    // Initial floor notes
    let initialAutoNotes = [];

    if (tempTeamAutoPickups[0] != null) {
        initialAutoNotes = String(tempTeamAutoPickups[0]).split(",");
    }

    for (let i = 0; i < initialAutoNotes.length; i++) {
        if (initialAutoNotes[i] == null) {
            break;
        }
        console.log(tempTempNotes);
        tempTempNotes[parseInt(initialAutoNotes[i]) % 8].style.backgroundColor = parseInt(initialAutoNotes[i]) > 7 ? "rgba(255, 0, 0, 0.4)" : "rgba(0, 255, 0, 0.4)";
    }

    // Create sidebar
    let tempAutoFloorSidebarContainer = document.createElement("div");
    tempAutoFloorSidebarContainer.id = "auto-floor-sidebar-container";

    // Sidebar select for match numbers
    let tempAutoFloorMatchSelect = document.createElement("select");
    tempAutoFloorMatchSelect.style.width = "20vh";
    for (let i = 0; i < tempTeamMatches.length; i++) {
        let tempOption = document.createElement("option");
        tempOption.value = [tempTeamRows[i][1].substring(0, 1), String(tempTeamAutoPickups[i])];
        tempOption.innerText = tempTeamMatches[i];
        tempAutoFloorMatchSelect.appendChild(tempOption);
    }

    tempAutoFloorMatchSelect.addEventListener("change", function () {
        let tempNoteLocations = document.getElementsByClassName("breakdown-floor-note");

        for (let i = 0; i < tempNoteLocations.length; i++) {
            tempNoteLocations[i].style.backgroundColor = "transparent";
        }

        let tempLocationsArray = this.value.split(',');
        console.log(tempLocationsArray);

        let alliance = tempLocationsArray.splice(0, 1);

        if (alliance == "R") {
            upperNoteContainer.style.scale = -1;
            lowerNoteContainer.style.scale = -1;
            lowerNoteContainer.style.marginLeft = "40%";
        } else {
            upperNoteContainer.style.scale = 1;
            lowerNoteContainer.style.scale = 1;
            lowerNoteContainer.style.marginLeft = "5%";
        }

        tempFloorImageContainer.style.backgroundImage = `url(img/${alliance == "B" ? "blue" : "red"}field24.jpg)`;

        for (let i = 0; i < tempLocationsArray.length; i++) {
            if (tempLocationsArray[i] == "null" || tempLocationsArray[i] == "undefined") {
                break;
            }
            tempNoteLocations[parseInt(tempLocationsArray[i]) % 8].style.backgroundColor = parseInt(tempLocationsArray[i]) > 7 ? "rgba(255, 0, 0, 0.4)" : "rgba(0, 255, 0, 0.4)";
        }
    });

    tempAutoFloorSidebarContainer.appendChild(tempAutoFloorMatchSelect);


    // Add sidebar, then floor image
    tempFloorContainer.appendChild(tempAutoFloorSidebarContainer);
    tempFloorContainer.appendChild(tempFloorImageContainer);



    let tempCommentContainer = document.createElement("div");
    tempCommentContainer.id = "breakdown-comment-container";
    tempCommentContainer.innerHTML = "<span style='text-decoration: underline; width: 100%; display: block'>Feedback & Videos:</span>";

    // Fetches matches for team, adds to comment section
    getTeamMatchesTBA(`https://www.thebluealliance.com/api/v3/team/frc${document.getElementById("team-breakdown-select").value}/event/${document.getElementById("event-select").value}/matches`);

    let speakerRanges = [];
    let intakeMethods = [];
    let trapCounter = 0;
    let climbSpeeds = [];

    //let commentText = "Comments: ";
    for (var i = 0; i < tempTeamRows.length; i++) {
        let tempComment = document.createElement("h1");
        tempComment.className = "breakdown-comment";
        tempComment.innerHTML = `<span style='color: rgb(255, 221, 109)'>Qual ${tempTeamRows[i][2]}:</span> ${tempTeamRows[i][7]}`;
        tempCommentContainer.appendChild(tempComment);

        speakerRanges.push(tempTeamRows[i][26]);
        intakeMethods.push(tempTeamRows[i][27]);

        if (tempTeamRows[i][24] != "N/A") {
            climbSpeeds.push(tempTeamRows[i][24]);
        }

        if (tempTeamRows[i][22] == "Successful") {
            trapCounter++;
        }
    }

    let teamFeatureContainer = document.createElement("div");
    teamFeatureContainer.id = "team-feature-container";

    let tempRange = document.createElement("h1");
    tempRange.className = "team-feature";
    tempRange.innerHTML = `Speaker range: <span style='font-weight: bold; font-size: 3vh; margin-left: 1vh; color: #ffa552'>${mode(speakerRanges)}</span>`;
    teamFeatureContainer.appendChild(tempRange);

    let tempIntake = document.createElement("h1");
    tempIntake.className = "team-feature";
    tempIntake.innerHTML = `Intake method: <span style='font-weight: bold; font-size: 3vh; margin-left: 1vh; color: #ffa552'>${mode(intakeMethods)}</span>`;
    teamFeatureContainer.appendChild(tempIntake);

    let tempTrap = document.createElement("h1");
    tempTrap.className = "team-feature";
    tempTrap.innerHTML = `Trapped: <span style='font-weight: bold; font-size: 3vh; margin-left: 1vh; color: #ffa552'>${trapCounter == 0 ? "No" : `${trapCounter} Traps`}</span>`;
    teamFeatureContainer.appendChild(tempTrap);

    let tempClimbSpeed = document.createElement("h1");
    tempClimbSpeed.className = "team-feature";
    tempClimbSpeed.innerHTML = `Climb speed: <span style='font-weight: bold; font-size: 3vh; margin-left: 1vh; color: #ffa552'>${mode(climbSpeeds) == null ? "Didn't climb" : mode(climbSpeeds)}</span>`;
    teamFeatureContainer.appendChild(tempClimbSpeed);

    tempCommentContainer.insertBefore(teamFeatureContainer, tempCommentContainer.children[1]);

    tempAutoFloorContainer.appendChild(tempAutoContainer);
    tempAutoFloorContainer.appendChild(tempFloorContainer);

    tempFeedbackContainer.appendChild(tempAutoFloorContainer);
    tempFeedbackContainer.appendChild(tempCommentContainer);

    // Array of all team auto types
    let team_auto_types = [];
    // Array of number of auto successes, corresponds with team_auto_types
    let team_auto_success = [];

    for (let g = 0; g < RECORDS.length; g++) {
        if (RECORDS[g][TEAM_INDEX] == document.getElementById("team-breakdown-select").value) {
            let tempAuto = "A";
            // Auto speaker made & missed
            tempAuto += RECORDS[g][8] + RECORDS[g][9];

            // Auto amp made & missed
            tempAuto += RECORDS[g][11] + RECORDS[g][12];

            if (RECORDS[g][13] == "Yes") {
                tempAuto += "M";
            }

            console.log(tempAuto);

            team_auto_success.push(1);
            team_auto_types.push(tempAuto);
        }
    }

    runAutoPie(team_auto_types, team_auto_success);
}