var newPickListQualities = {
    sortedList: []
}

function setUpNewPickList() {
    if (TEAMS.length < 3) {
        getTeamData();
    }

    rawTable.innerHTML = '';
    graphContainer.style.display = '';

    newPickListQualities.sortedList = localStorage.getItem("new-sorted-pick-list");

    // If no pick list loaded, default to sorting by total points
    if (newPickListQualities.sortedList == null || localStorage.getItem("new-sorted-pick-list") == null) {
        console.warn('Null pick list, adding sorted by total points.');

        let sortedTotalPoints = TEAM_COLUMNS[TEAM_FIELDS.indexOf('Total Points')].toSorted((x, y) => y - x);
        let sortedTeams = [];
        let unchosenTeams = JSON.parse(JSON.stringify(TEAMS));

        for (let i = 0; i < sortedTotalPoints.length; i++) {
            for (let t = 0; t < unchosenTeams.length; t++) {
                if (Math.round(sortedTotalPoints[i] * 100) == Math.round(TEAM_COLUMNS[TEAM_FIELDS.indexOf('Total Points')][TEAMS.indexOf(unchosenTeams[t])] * 100)) {
                    sortedTeams.push(unchosenTeams[t]);
                    unchosenTeams.splice(t, 1);
                    break;
                }
            }
        }

        newPickListQualities.sortedList = sortedTeams;

        showGreetingScreenPrompt();
    }

    console.log(newPickListQualities);
}

function showGreetingScreenPrompt() {
    rawTable.innerHTML = `<div style='display: flex; flex-direction: column; align-items: left'>
    <button class='pick-list-operator-button' onclick='generateNewPickList();'>Generate</button>
    <h5>Pick list instructions:</h5>
    <h2 class='new-pick-list-instructions-bullet'>- No pick list could be loaded from device</h2>
    <h2 class='new-pick-list-instructions-bullet'>- Default pick list created sorted by team total points</h2>
    <h2 class='new-pick-list-instructions-bullet'>- Click the 'Generate' button to create a new custom pick list. If saved, this will override old pick list.</h2>
    <h2 class='new-pick-list-instructions-bullet'>- Pick list saves in browser cache so should be retained between sessions</h2>
    <h2 class='new-pick-list-instructions-bullet'>- Pick list will only update on your screen locally, not online</h2>
    </div>`;
}

function generateNewPickList() {
    rawTable.innerHTML = `<div style='display: flex; flex-direction: column; align-items: left'>
    <button class='pick-list-operator-button' style='right: 25vh;'>Save List</button>
    <button class='pick-list-operator-button' onclick='setUpNewPickList();'>Cancel</button>
    <h5>Generate pick list...</h5>
    <h2 class='new-pick-list-instructions-bullet'>- Weigh statistics 0 (no impact) to 1 (heaviest impact)</h2>
    <h2 class='new-pick-list-instructions-bullet'>- Weights are multiplied by standard deviations from mean of specified statistic</h2>
    <h2 class='new-pick-list-instructions-bullet'>- Require certain features, teams that do not fit criteria will be listed separately</h2>
    </div>`;
}