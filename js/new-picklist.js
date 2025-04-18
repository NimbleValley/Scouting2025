var newPickListOrderTeams = [];
var newTempPickListOrderTeams = [];

function setUpNewPickList() {
    if (TEAMS.length < 3) {
        getTeamData();
    }

    rawTable.innerHTML = '';
    graphContainer.style.display = '';

    newPickListOrderTeams = JSON.parse(localStorage.getItem("new-sorted-pick-list"));

    // If no pick list loaded, default to sorting by total points
    if (newPickListOrderTeams == null || localStorage.getItem("new-sorted-pick-list") == null) {
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

        showGreetingScreenPrompt();
    } else {
        showFinalNewPickList();
    }
}

function showGreetingScreenPrompt() {
    rawTable.innerHTML = `<div style='display: flex; flex-direction: column; align-items: left'>
    <button class='pick-list-operator-button' onclick='generateNewPickList();'>Generate</button>
    <h5>Pick list instructions:</h5>
    <h2 class='new-pick-list-instructions-bullet'>- No pick list could be loaded from device</h2>
    <h2 class='new-pick-list-instructions-bullet'>- Click the 'Generate' button to create a new custom pick list. If saved, this will override old pick list.</h2>
    <h2 class='new-pick-list-instructions-bullet'>- Pick list saves in browser cache so should be retained between sessions</h2>
    <h2 class='new-pick-list-instructions-bullet'>- Pick list will only update on your screen locally, not online</h2>
    </div>`;
}

var temporaryPickListAttributes = {
    totalPoints: 1,
    autoPoints: 0.2,
    telePoints: 0.2,
    algaeRemoved: 0.1,
    bargePoints: 0,
    intakeSpeed: 0.2,
    driverSkill: 0.4,
    endgamePoints: 0.4,
    totalCoral: 0.4
}

var fields = ['Total Points', 'Auto Points', 'Tele Points', 'Algae Removed', 'Barge Points', 'Intake Speed', 'Driver Skill', 'Endgame Points', 'Total Coral'];

var previewWeightsGraph;

function generateNewPickList() {
    temporaryPickListAttributes = {
        totalPoints: 1,
        autoPoints: 0.2,
        telePoints: 0.2,
        algaeRemoved: 0.1,
        bargePoints: 0,
        intakeSpeed: 0.2,
        driverSkill: 0.4,
        endgamePoints: 0.4,
        totalCoral: 0.4
    }
    //    <h2 class='new-pick-list-instructions-bullet'>- Require certain features, teams that do not fit criteria will be listed separately</h2>

    rawTable.innerHTML = `<div style='display: flex; flex-direction: column; align-items: left'>
    <button class='pick-list-operator-button' style='right: 25vh;' onclick='finalizeNewPickList();'>Save List</button>
    <button class='pick-list-operator-button' onclick='setUpNewPickList();'>Cancel</button>
    <h5>Generate pick list...</h5>
    <h2 class='new-pick-list-instructions-bullet'>- Weigh statistics 0 (no impact) to 1 (heaviest impact)</h2>
    <h2 class='new-pick-list-instructions-bullet'>- Weights are multiplied by z-score of specified statistic</h2>
    
    <div class='scout-form-generation-slider-container'>
        <input type="range" min="0" max="1" value="1" step="0.1" class="slider" id="total-point-weight-slider">
        <h6 id="total-point-weight-label">Total points: 1</h6>
    </div>

    <div class='scout-form-generation-slider-container'>
        <input type="range" min="0" max="1" value="0.2" step="0.1" class="slider" id="auto-point-weight-slider">
        <h6 id="auto-point-weight-label">Auto points: 0.2</h6>
    </div>

    <div class='scout-form-generation-slider-container'>
        <input type="range" min="0" max="1" value="0.2" step="0.1" class="slider" id="tele-point-weight-slider">
        <h6 id="tele-point-weight-label">Tele points: 0.2</h6>
    </div>

    <div class='scout-form-generation-slider-container'>
        <input type="range" min="0" max="1" value="0.1" step="0.1" class="slider" id="algae-removed-weight-slider">
        <h6 id='algae-removed-weight-label'>Algae removed: 0.1</h6>
    </div>

    <div class='scout-form-generation-slider-container'>
        <input type="range" min="0" max="1" value="0" step="0.1" class="slider" id="barge-points-weight-slider">
        <h6 id='barge-points-weight-label'>Barge points: 0</h6>
    </div>

    <div class='scout-form-generation-slider-container'>
        <input type="range" min="0" max="1" value="0.2" step="0.1" class="slider" id="intake-speed-weight-slider">
        <h6 id='intake-speed-weight-label'>Intake speed: 0.2</h6>
    </div>

    <div class='scout-form-generation-slider-container'>
        <input type="range" min="0" max="1" value="0.4" step="0.1" class="slider" id="driver-skill-weight-slider">
        <h6 id='driver-skill-weight-label'>Driver skill: 0.4</h6>
    </div>

    <div class='scout-form-generation-slider-container'>
        <input type="range" min="0" max="1" value="0.4" step="0.1" class="slider" id="endgame-point-weight-slider">
        <h6 id='endgame-point-weight-label'>Endgame points: 0.4</h6>
    </div>

    <div class='scout-form-generation-slider-container'>
        <input type="range" min="0" max="1" value="0.4" step="0.1" class="slider" id="total-coral-weight-slider">
        <h6 id='total-coral-weight-label'>Total coral: 0.4</h6>
    </div>

    <div id='preview-weights-canvas-container'>
    <canvas id='preview-weights-canvas'></canvas>
    </div>

    </div>
    
    <div style='margin-left: 10vh'>
        <h5>Preview list:</h5>
        <div id='pick-list-preview-container'></div>
    </div>
    `;

    document.getElementById('total-point-weight-slider').addEventListener('input', function () {
        document.getElementById('total-point-weight-label').innerText = `Total points: ${this.value}`;
        temporaryPickListAttributes.totalPoints = parseFloat(this.value);

        handleWeightsChange();
    });

    document.getElementById('auto-point-weight-slider').addEventListener('input', function () {
        document.getElementById('auto-point-weight-label').innerText = `Auto points: ${this.value}`;
        temporaryPickListAttributes.autoPoints = parseFloat(this.value);
        handleWeightsChange();
    });

    document.getElementById('tele-point-weight-slider').addEventListener('input', function () {
        document.getElementById('tele-point-weight-label').innerText = `Tele points: ${this.value}`;
        temporaryPickListAttributes.telePoints = parseFloat(this.value);
        handleWeightsChange();
    });

    document.getElementById('algae-removed-weight-slider').addEventListener('input', function () {
        document.getElementById('algae-removed-weight-label').innerText = `Algae removed: ${this.value}`;
        temporaryPickListAttributes.algaeRemoved = parseFloat(this.value);
        handleWeightsChange();
    });

    document.getElementById('barge-points-weight-slider').addEventListener('input', function () {
        document.getElementById('barge-points-weight-label').innerText = `Barge points: ${this.value}`;
        temporaryPickListAttributes.bargePoints = parseFloat(this.value);
        handleWeightsChange();
    });

    document.getElementById('intake-speed-weight-slider').addEventListener('input', function () {
        document.getElementById('intake-speed-weight-label').innerText = `Intake speed: ${this.value}`;
        temporaryPickListAttributes.intakeSpeed = parseFloat(this.value);
        handleWeightsChange();
    });

    document.getElementById('driver-skill-weight-slider').addEventListener('input', function () {
        document.getElementById('driver-skill-weight-label').innerText = `Driver skill: ${this.value}`;
        temporaryPickListAttributes.driverSkill = parseFloat(this.value);
        handleWeightsChange();
    });

    document.getElementById('endgame-point-weight-slider').addEventListener('input', function () {
        document.getElementById('endgame-point-weight-label').innerText = `Endgame points: ${this.value}`;
        temporaryPickListAttributes.endgamePoints = parseFloat(this.value);
        handleWeightsChange();
    });

    document.getElementById('total-coral-weight-slider').addEventListener('input', function () {
        document.getElementById('total-coral-weight-label').innerText = `Total coral: ${this.value}`;
        temporaryPickListAttributes.totalCoral = parseFloat(this.value);
        handleWeightsChange();
    });

    handleWeightsChange();
    previewNewPickList();
}

function handleWeightsChange() {
    if (previewWeightsGraph != null) {
        previewWeightsGraph.destroy();
    }

    let tempData = [temporaryPickListAttributes.totalPoints, temporaryPickListAttributes.autoPoints, temporaryPickListAttributes.telePoints, temporaryPickListAttributes.algaeRemoved, temporaryPickListAttributes.bargePoints, temporaryPickListAttributes.intakeSpeed, temporaryPickListAttributes.driverSkill, temporaryPickListAttributes.endgamePoints, temporaryPickListAttributes.totalCoral];
    let tempFields = ['Total Points', 'Auto Points', 'Tele Points', 'Algae Removed', 'Barge Points', 'Intake Speed', 'Driver Skill', 'Endgame Points', 'Total Coral'];

    for (let i = 0; i < tempData.length; i++) {
        if (parseFloat(tempData[i]) == 0.0) {
            tempData.splice(i, 1);
            tempFields.splice(i, 1);
            i--;
        }
    }

    previewWeightsGraph = updatePreviewPieChart(document.getElementById('preview-weights-canvas'), tempFields, tempData);

    previewNewPickList();
}

function updatePreviewPieChart(canvas, fields, weights) {

    canvas.width = '30vw';

    console.log("Rendering horizontal bar graph.");

    var data = [];

    for (let i = 0; i < fields.length; i++) {
        data.push({ field: fields[i], count: weights[i] })
    }

    const config = {
        type: 'pie',
        responsive: false,
        data: {
            labels: data.map(x => x.field),
            datasets: [
                {
                    label: 'Weights preview',
                    data: data.map(row => row.count),
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)',
                        'rgb(100, 205, 86)',
                        'rgb(255, 20, 86)',
                        'rgb(255, 205, 255)',
                        'rgb(150, 155, 255)'
                    ],
                    hoverOffset: 4
                }
            ]
        }
    };

    graph = new Chart(canvas, config);
    return graph;
}

function previewNewPickList() {
    let unsortedScores = [];
    let tempTeams = JSON.parse(JSON.stringify(TEAMS));

    let weights = [temporaryPickListAttributes.totalPoints, temporaryPickListAttributes.autoPoints, temporaryPickListAttributes.telePoints, temporaryPickListAttributes.algaeRemoved, temporaryPickListAttributes.bargePoints, temporaryPickListAttributes.intakeSpeed, temporaryPickListAttributes.driverSkill, temporaryPickListAttributes.endgamePoints, temporaryPickListAttributes.totalCoral];
    let weightCategories = [TEAM_COLUMNS[TEAM_FIELDS.indexOf('Total Points')], TEAM_COLUMNS[TEAM_FIELDS.indexOf('Auto Points')], TEAM_COLUMNS[TEAM_FIELDS.indexOf('Tele Points')], TEAM_COLUMNS[TEAM_FIELDS.indexOf('Total Algae Removed')], TEAM_COLUMNS[TEAM_FIELDS.indexOf('Total Net')], TEAM_COLUMNS[TEAM_FIELDS.indexOf('Intake Rating')], TEAM_COLUMNS[TEAM_FIELDS.indexOf('Driver Rating')], TEAM_COLUMNS[TEAM_FIELDS.indexOf('Endgame Points')], TEAM_COLUMNS[TEAM_FIELDS.indexOf('Total Coral')]];

    for (let t = 0; t < tempTeams.length; t++) {
        let tempTotal = 0;
        for (let i = 0; i < weights.length; i++) {
            tempTotal += weights[i] * calculateZScore(weightCategories[i], weightCategories[i][t]);
        }
        unsortedScores.push(tempTotal);
    }

    // Now we have z-scores, better sort
    let sortedScores = unsortedScores.toSorted((x, y) => y - x);
    let retainedSortedScores = JSON.parse(JSON.stringify(sortedScores));
    let sortedTeams = [];

    while (tempTeams.length > 0) {
        for (let i = 0; i < unsortedScores.length; i++) {
            if (unsortedScores[i] == sortedScores[0]) {
                sortedTeams.push(tempTeams[i]);
                tempTeams.splice(i, 1);
                unsortedScores.splice(i, 1);
                sortedScores.splice(0, 1);
            }
        }
    }

    console.log(sortedTeams);
    let previewContainer = document.getElementById('pick-list-preview-container');
    previewContainer.innerHTML = '';
    for (let i = 0; i < sortedTeams.length; i++) {
        let tempTeamReadoutContainer = document.createElement('div');
        tempTeamReadoutContainer.style.display = 'flex';
        tempTeamReadoutContainer.style.justifyContent = 'space-between';
        tempTeamReadoutContainer.style.width = '20vh';

        let color = ((retainedSortedScores[i] + Math.abs(retainedSortedScores[retainedSortedScores.length - 1])) / (retainedSortedScores[0] + Math.abs(retainedSortedScores[retainedSortedScores.length - 1])));

        tempTeamReadoutContainer.innerHTML = `<h2 class='new-pick-list-preview-text'>${sortedTeams[i]}</h2> <h2 class='new-pick-list-preview-text' style='box-shadow: 0px 0px 0px 100vh inset rgba(${(1 - color) * 255}, ${color * 255}, 0, ${Math.pow(Math.abs(color - 0.5) * 4, 2)})'>${Math.round(retainedSortedScores[i] * 10) / 10}</h2>`;
        previewContainer.appendChild(tempTeamReadoutContainer);
    }

    newTempPickListOrderTeams = sortedTeams;
}

function calculateZScore(array, value) {
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return (value - mean) / getStandardDeviation(array);
}

function getStandardDeviation(array) {
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

function finalizeNewPickList() {
    newPickListOrderTeams = newTempPickListOrderTeams;
    showFinalNewPickList();
}

function showFinalNewPickList() {

    rawTable.innerHTML = `<div id='new-pick-list-full-container'><button class='pick-list-operator-button' style='right: 25vh;' onclick='generateNewPickList();'>Generate</button> <button class='pick-list-operator-button' onclick='copyPickList()'>Export</button>
    <h5>Draggable pick list:</h5>
    <div style='display: flex;'>
    <div id='new-pick-list-number-container'></div>
    <div id='new-pick-list-draggable-container'></div>
    </div>
    </div>
    `;

    let pickListContainerDraggable = document.getElementById('new-pick-list-draggable-container');
    let pickListContainerNumber = document.getElementById('new-pick-list-number-container');

    localStorage.setItem("new-sorted-pick-list", JSON.stringify(newPickListOrderTeams));

    for (let i = 0; i < newPickListOrderTeams.length; i++) {
        let tempTeamReadoutContainer = document.createElement('div');
        tempTeamReadoutContainer.className = 'new-pick-list-draggable-team-container';

        tempTeamReadoutContainer.addEventListener('click', function (e) {
            localStorage.setItem('breakdown-team', parseInt(this.innerText));
            setUpTeamBreakdowns();
            e.preventDefault();
            removeActive();
        });

        tempTeamReadoutContainer.innerHTML = `<h2 class='new-pick-list-team-text'>${newPickListOrderTeams[i]}</h2> `;
        pickListContainerDraggable.appendChild(tempTeamReadoutContainer);

        let tempNumberContainer = document.createElement('div');
        tempNumberContainer.style.display = 'flex';
        tempNumberContainer.style.justifyContent = 'space-between';
        tempNumberContainer.style.width = '20vh';

        tempNumberContainer.innerHTML = `<h2 class='new-pick-list-preview-text'>${i}</h2> `;
        pickListContainerNumber.appendChild(tempNumberContainer);
    }

    new Sortable(pickListContainerDraggable, {
        // Drag animation delay, ms
        animation: 150,
        ghostClass: 'sortable-ghost',
        onUpdate: function (event) {
            newPickListOrderTeams = [];
            let tempTeamContainers = document.getElementsByClassName('new-pick-list-team-text');
            for (let i = 0; i < tempTeamContainers.length; i++) {
                newPickListOrderTeams.push(parseInt(tempTeamContainers[i].innerText));
            }
            console.log(newPickListOrderTeams);
            localStorage.setItem("new-sorted-pick-list", JSON.stringify(newPickListOrderTeams));
            // Old pick list key
            /*let oldTeam = newPickListOrderTeams[event.oldIndex];

            for (var i = 0; i < Math.abs(event.oldIndex - event.newIndex); i++) {
                // Loops through all elements between the modified indicies, 
                // and bumps them up or down oen depending on direction
                if (event.oldIndex > event.newIndex) {
                    PICK_LIST_TEAM_KEY[event.oldIndex - i] = PICK_LIST_TEAM_KEY[event.oldIndex - i - 1];
                    green[event.oldIndex - i].id = parseInt(green[event.oldIndex - i].id) + 1;
                    yellow[event.oldIndex - i].id = parseInt(yellow[event.oldIndex - i].id) + 1;
                    red[event.oldIndex - i].id = parseInt(red[event.oldIndex - i].id) + 1;
                    info[event.oldIndex - i].id = parseInt(info[event.oldIndex - i].id) + 1;
                } else {
                    PICK_LIST_OBJECTS[event.oldIndex + i] = PICK_LIST_OBJECTS[event.oldIndex + i + 1];
                    PICK_LIST_TEAM_KEY[event.oldIndex + i] = PICK_LIST_TEAM_KEY[event.oldIndex + i + 1];
                    green[event.oldIndex + i].id = parseInt(green[event.oldIndex + i].id) - 1;
                    yellow[event.oldIndex + i].id = parseInt(yellow[event.oldIndex + i].id) - 1;
                    red[event.oldIndex + i].id = parseInt(red[event.oldIndex + i].id) - 1;
                    info[event.oldIndex + i].id = parseInt(info[event.oldIndex + i].id) - 1;
                }
            }
            // Swap the objects & buttons
            PICK_LIST_OBJECTS[event.newIndex] = oldObject;
            PICK_LIST_TEAM_KEY[event.newIndex] = oldKey;
            green[event.newIndex].id = event.newIndex;
            yellow[event.newIndex].id = event.newIndex;
            red[event.newIndex].id = event.newIndex;
            info[event.newIndex].id = event.newIndex;*/
        }
    });
}

async function copyPickList() {
    let text = JSON.stringify(newPickListOrderTeams);
    text = text.replace(/,/g, '\n');
    text = text.replace('[', '');
    text = text.replace(']', '');
    try {
        await navigator.clipboard.writeText(text);
        alert('Pick list copied to clipboard. Open new document or spreadsheet to paste & print list.');
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
}