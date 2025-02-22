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

var temporaryPickListAttributes = {
    totalPoints: 1,
    autoPoints: 0.2,
    telePoints: 0.2,
    algaeRemoved: 0.1,
    bargePoints: 0,
    intakeSpeed: 0.2,
    driverSkill: 0.4
}

var fields = ['Total Points', 'Auto Points', 'Tele Points', 'Algae Removed', 'Barge Points', 'Intake Speed', 'Driver Skill'];

var previewWeightsGraph;

function generateNewPickList() {
    temporaryPickListAttributes = {
        totalPoints: 1,
        autoPoints: 0.2,
        telePoints: 0.2,
        algaeRemoved: 0.1,
        bargePoints: 0,
        intakeSpeed: 0.2,
        driverSkill: 0.4
    }
    //    <h2 class='new-pick-list-instructions-bullet'>- Require certain features, teams that do not fit criteria will be listed separately</h2>

    rawTable.innerHTML = `<div style='display: flex; flex-direction: column; align-items: left'>
    <button class='pick-list-operator-button' style='right: 25vh;'>Save List</button>
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

    <div id='preview-weights-canvas-container'>
    <canvas id='preview-weights-canvas'></canvas>
    </div>

    </div>`;

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
        document.getElementById('barge-points-weight-label').innerText = `Algae removed: ${this.value}`;
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

    handleWeightsChange();
}

function handleWeightsChange() {
    if (previewWeightsGraph != null) {
        previewWeightsGraph.destroy();
    }

    let tempData = [temporaryPickListAttributes.totalPoints, temporaryPickListAttributes.autoPoints, temporaryPickListAttributes.telePoints, temporaryPickListAttributes.algaeRemoved, temporaryPickListAttributes.bargePoints, temporaryPickListAttributes.intakeSpeed, temporaryPickListAttributes.driverSkill];
    let tempFields = ['Total Points', 'Auto Points', 'Tele Points', 'Algae Removed', 'Barge Points', 'Intake Speed', 'Driver Skill'];

    for (let i = 0; i < tempData.length; i++) {
        if (parseFloat(tempData[i]) == 0.0) {
            tempData.splice(i, 1);
            tempFields.splice(i, 1);
            i--;
        }
    }

    previewWeightsGraph = updatePreviewPieChart(document.getElementById('preview-weights-canvas'), tempFields, tempData)
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