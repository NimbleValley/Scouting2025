var simulationChart;

function setUpSimulations() {
    if (TEAMS.length < 2) {
        getTeamData();
    }

    rawTable.innerHTML = '';
    graphContainer.style.display = 'none';
    pickListContainer.style.display = 'none';
    breakdownGrid.style.display = 'none';

    let simulateContainer = document.createElement('div');
    simulateContainer.id = 'simulate-container';

    let simulateHeader = document.createElement('div');
    simulateHeader.id = 'simulate-header';

    let simulationOutputContainer = document.createElement('div');
    simulationOutputContainer.id = 'simulation-output-container';

    let teamSelects = [];
    for (let i = 0; i < 3; i++) {
        let tempSelect = document.createElement('select');
        tempSelect.className = 'simulation-team-select';

        let tempOption1 = document.createElement('option');
        tempOption1.value = 'None';
        tempOption1.innerText = 'None';
        tempSelect.appendChild(tempOption1);

        let tempOption2 = document.createElement('option');
        tempOption2.value = 'Find';
        tempOption2.innerText = 'Find';
        tempSelect.appendChild(tempOption2);

        for (let t = 0; t < TEAMS.length; t++) {
            let tempOption = document.createElement('option');
            tempOption.value = TEAMS[t];
            tempOption.innerText = TEAMS[t];

            tempSelect.appendChild(tempOption);
        }

        simulateHeader.appendChild(tempSelect);
        teamSelects.push(tempSelect);
    }

    let simulateButton = document.createElement('button');
    simulateButton.innerText = 'Simulate';
    simulateButton.onclick = runSimulations;
    simulateHeader.appendChild(simulateButton);

    simulateContainer.appendChild(simulateHeader);
    simulateContainer.appendChild(simulationOutputContainer);

    rawTable.appendChild(simulateContainer);
}

function runSimulations() {
    let teamSelects = document.getElementsByClassName('simulation-team-select');
    let teams = [];
    for (let i = 0; i < 3; i++) {
        teams.push(parseInt(teamSelects[i].value));
    }
    console.log(teams);

    let simulationOutputContainer = document.getElementById('simulation-output-container');
    simulationOutputContainer.innerHTML = 'Simulating...';

    let teamResults = [[], [], []];
    for (let i = 0; i < RECORDS.length; i++) {
        let index = teams.indexOf(parseInt(RECORDS[i][TEAM_INDEX]));
        if (index != -1) {
            teamResults[index].push(RECORDS[i]);
        }
    }

    let trials = [];
    let average = 0;
    for (let t1 = 0; t1 < teamResults[0].length; t1++) {
        for (let t2 = 0; t2 < teamResults[1].length; t2++) {
            for (let t3 = 0; t3 < teamResults[2].length; t3++) {
                trials.push(runTrial(teamResults[0][t1], teamResults[1][t2], teamResults[2][t3]));
                average += trials[trials.length - 1];
            }
        }
    }
    average /= trials.length;

    let trialAverage = document.createElement('div');
    trialAverage.innerText = `Average: ${Math.round(average * 100) / 100}`;
    simulationOutputContainer.innerHTML = '';
    simulationOutputContainer.appendChild(trialAverage);

    let sortedTrials = trials.sort((a, b) => a - b);

    let trialMedian = document.createElement('div');
    trialMedian.innerText = `Median: ${sortedTrials[Math.round(sortedTrials.length / 2)]}`;
    simulationOutputContainer.appendChild(trialMedian);

    let trialMax = document.createElement('div');
    trialMax.innerText = `Max: ${sortedTrials[sortedTrials.length - 1]}`;
    simulationOutputContainer.appendChild(trialMax);

    let trialMin = document.createElement('div');
    trialMin.innerText = `Min: ${sortedTrials[0]}`;
    simulationOutputContainer.appendChild(trialMin);

    let trialQ3 = document.createElement('div');
    trialQ3.innerText = `Q3: ${sortedTrials[Math.round(sortedTrials.length * (3 / 4))]}`;
    simulationOutputContainer.appendChild(trialQ3);

    let simulationCanvas = document.createElement('canvas');
    simulationCanvas.id = 'simulation-canvas';
    simulationCanvas.width = window.innerWidth * (3 / 4)
    simulationOutputContainer.appendChild(simulationCanvas);

    let keys = [];
    let frequencies = [];
    while (sortedTrials.length > 0) {
        if (!keys.includes(sortedTrials[0])) {
            keys.push(sortedTrials[0]);
            frequencies.push(1);
        } else {
            frequencies[frequencies.length - 1]++;
        }
        sortedTrials.splice(0, 1);
    }

    showBarChart(simulationCanvas, keys, frequencies);

    console.log(teamResults, keys, frequencies);
}

function runTrial(r1, r2, r3) {
    let points = 0;
    points += parseInt(r1[FIELDS.indexOf('Auto Points')]) + parseInt(r2[FIELDS.indexOf('Auto Points')]) + parseInt(r3[FIELDS.indexOf('Auto Points')]);

    let totalAmpPeriods = Math.floor((parseInt(r1[FIELDS.indexOf('Tele Made Amp')]) + parseInt(r2[FIELDS.indexOf('Tele Made Amp')]) + parseInt(r3[FIELDS.indexOf('Tele Made Amp')])) / 2);

    let totalSpeakerShots = parseInt(r1[FIELDS.indexOf('Tele Made Speaker')]) + parseInt(r2[FIELDS.indexOf('Tele Made Speaker')]) + parseInt(r3[FIELDS.indexOf('Tele Made Speaker')]);
    totalSpeakerShots += Math.round((parseInt(r1[FIELDS.indexOf('Tele Missed Speaker')]) + parseInt(r2[FIELDS.indexOf('Tele Missed Speaker')]) + parseInt(r3[FIELDS.indexOf('Tele Missed Speaker')])) / 2);

    let averageTime = 135 / totalSpeakerShots;

    let ampedShotPoints = Math.round((10 / averageTime) * 5);
    let ifAllAmped = 5 * totalSpeakerShots;

    let unAmped = ifAllAmped - ampedShotPoints;
    if (unAmped > 0) {
        points += Math.round(unAmped / 5 * 2);
    }
    points += ampedShotPoints;
    points += totalAmpPeriods;

    points += parseInt(r1[FIELDS.indexOf('Endgame Points')]) + parseInt(r2[FIELDS.indexOf('Endgame Points')]) + parseInt(r3[FIELDS.indexOf('Endgame Points')]);

    return points;
}

function showBarChart(canvas, labels, values) {
    const data = {
        labels: labels,
        datasets: [{
            label: 'Frequency',
            data: values,
            backgroundColor: [
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgb(255, 159, 64)'
            ],
            borderWidth: 1
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Simulation Frequencies'
                }
            }
        },
    };

    simulationChart = new Chart(canvas, config);
}