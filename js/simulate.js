var simulationChart;

function setUpSimulations() {
    if (TEAMS.length < 2) {
        getTeamData();
    }

    let simulationType = localStorage.getItem('simulation-type');
    if (simulationType == null) {
        simulationType = 'head';
    }
    console.log(simulationType);

    rawTable.innerHTML = '';
    graphContainer.style.display = 'none';

    let simulateContainer = document.createElement('div');
    simulateContainer.id = 'simulate-container';

    let simulateHeader = document.createElement('div');
    simulateHeader.id = 'simulate-header';

    let simulationOutputContainer = document.createElement('div');
    simulationOutputContainer.id = 'simulation-output-container';

    let simulateTypeContainer = document.createElement('div');

    let simulationTypeSelect = document.createElement('select');
    simulationTypeSelect.id = 'simulate-type-select';
    simulationTypeSelect.name = 'simulate-type-select';
    simulationTypeSelect.innerHTML = `<option value='head'>Head-to-head</option><option value='alliances'>Alliances</option><option value='trials'>Trials</option>`;
    simulationTypeSelect.value = simulationType;
    simulationTypeSelect.addEventListener('change', function () {
        localStorage.setItem('simulation-type', simulationTypeSelect.value);
        setUpSimulations();
    });

    simulateTypeContainer.innerHTML = `<label for='simulate-type-select'>Simulation type: </label>`;
    simulateTypeContainer.appendChild(simulationTypeSelect);
    simulateHeader.appendChild(simulateTypeContainer);

    let teamSelects = [];
    let simulationDetailsContainer = document.createElement('div');
    switch (simulationType) {
        case 'trials':
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

                simulationDetailsContainer.appendChild(tempSelect);
                teamSelects.push(tempSelect);
            }
            break;
        case 'head':
            for (let i = 0; i < 3; i++) {
                let tempSelect = document.createElement('select');
                tempSelect.className = 'simulation-team-select';

                let tempOption1 = document.createElement('option');
                tempOption1.value = '-Choose-';
                tempOption1.innerText = '-Choose-';
                tempSelect.appendChild(tempOption1);

                for (let t = 0; t < TEAMS.length; t++) {
                    let tempOption = document.createElement('option');
                    tempOption.value = TEAMS[t];
                    tempOption.innerText = TEAMS[t];

                    tempSelect.appendChild(tempOption);
                }

                simulationDetailsContainer.appendChild(tempSelect);
                teamSelects.push(tempSelect);
            }
            let versusText = document.createElement('h6');
            versusText.innerText = 'VS';
            simulationDetailsContainer.appendChild(versusText);
            for (let i = 0; i < 3; i++) {
                let tempSelect = document.createElement('select');
                tempSelect.className = 'simulation-team-select';

                let tempOption1 = document.createElement('option');
                tempOption1.value = '-Choose-';
                tempOption1.innerText = '-Choose-';
                tempSelect.appendChild(tempOption1);

                for (let t = 0; t < TEAMS.length; t++) {
                    let tempOption = document.createElement('option');
                    tempOption.value = TEAMS[t];
                    tempOption.innerText = TEAMS[t];

                    tempSelect.appendChild(tempOption);
                }

                simulationDetailsContainer.appendChild(tempSelect);
                teamSelects.push(tempSelect);
            }
            let numberText = document.createElement('h6');
            numberText.innerText = '10,000 trials';
            simulationDetailsContainer.appendChild(numberText);
            break;
    }

    let simulateButton = document.createElement('button');
    simulateButton.innerText = 'Simulate';
    simulateButton.onclick = simulationSubmitEvent;
    simulationDetailsContainer.appendChild(simulateButton);

    simulateHeader.appendChild(simulationDetailsContainer);

    simulateContainer.appendChild(simulateHeader);
    simulateContainer.appendChild(simulationOutputContainer);

    rawTable.appendChild(simulateContainer);
}

function simulationSubmitEvent() {
    let simulationType = localStorage.getItem('simulation-type');
    if (simulationType == null) {
        simulationType = 'head';
    }
    switch (simulationType) {
        case 'trials':
            runSimulations();
            break;
        case 'head':
            runSampleDifferenceOfMeans();
            break;
    }
}

function runSampleDifferenceOfMeans() {
    let teamSelects = document.getElementsByClassName('simulation-team-select');
    let teams = [];
    for (let i = 0; i < 6; i++) {
        teams.push(parseInt(teamSelects[i].value));
    }
    console.log(teams);

    let simulationOutputContainer = document.getElementById('simulation-output-container');
    simulationOutputContainer.innerHTML = 'Simulating...';

    let teamResults = [[], [], [], [], [], [], []];
    for (let i = 0; i < RECORDS.length; i++) {
        let index = teams.indexOf(parseInt(RECORDS[i][TEAM_INDEX]));
        if (index != -1) {
            teamResults[index].push(RECORDS[i]);
        }
    }

    let trialsAllianceA = [];
    let trialsAllianceB = [];

    for (let t1 = 0; t1 < teamResults[0].length; t1++) {
        for (let t2 = 0; t2 < teamResults[1].length; t2++) {
            for (let t3 = 0; t3 < teamResults[2].length; t3++) {
                trialsAllianceA.push(runTrial(teamResults[0][t1], teamResults[1][t2], teamResults[2][t3]));
            }
        }
    }

    for (let t1 = 0; t1 < teamResults[3].length; t1++) {
        for (let t2 = 0; t2 < teamResults[4].length; t2++) {
            for (let t3 = 0; t3 < teamResults[5].length; t3++) {
                trialsAllianceB.push(runTrial(teamResults[3][t1], teamResults[4][t2], teamResults[5][t3]));
            }
        }
    }

    // Now randomly populate samples
    let differenceSamples = [];
    for (let i = 0; i < 10000; i++) {
        let difference = trialsAllianceA[Math.floor(Math.random() * trialsAllianceA.length)] - trialsAllianceB[Math.floor(Math.random() * trialsAllianceB.length)];
        difference += Math.round(15 * (Math.random() - 0.5));
        differenceSamples.push(difference);
    }

    // Sort differences
    let sortedDifferences = differenceSamples.sort((a, b) => a - b);

    let standardDeviation = getStandardDeviation(sortedDifferences);
    let mean = getMean(sortedDifferences);
    let aWinPercentage = cdfNormal(0.0, mean, standardDeviation);

    let aWinPercentageText = document.createElement('div');
    aWinPercentageText.innerText = `Alliance 1 Win Percentage: ${Math.round((1-aWinPercentage)*100*10)/10}%`;
    simulationOutputContainer.innerHTML = '';
    simulationOutputContainer.appendChild(aWinPercentageText);

    let bWinPercentageText = document.createElement('div');
    bWinPercentageText.innerText = `Alliance 2 Win Percentage: ${Math.round((aWinPercentage)*100*10)/10}%`;
    simulationOutputContainer.appendChild(bWinPercentageText);

    let simulationCanvas = document.createElement('canvas');
    simulationCanvas.id = 'simulation-canvas';
    simulationCanvas.width = window.innerWidth * (3 / 4)
    simulationOutputContainer.appendChild(simulationCanvas);

    let keys = [];
    let frequencies = [];
    while (sortedDifferences.length > 0) {
        if (!keys.includes(sortedDifferences[0])) {
            keys.push(sortedDifferences[0]);
            frequencies.push(1);
        } else {
            frequencies[frequencies.length - 1]++;
        }
        sortedDifferences.splice(0, 1);
    }

    showBarChart(simulationCanvas, keys, frequencies);
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

    //console.log(teamResults, keys, frequencies);
}

function runTrial(r1, r2, r3) {
    let points = 0;

    let teleCoralBot1 = Math.round(parseInt(r1[FIELDS.indexOf('Tele Coral')]) * 1.15);
    let teleCoralBot2 = Math.round(parseInt(r2[FIELDS.indexOf('Tele Coral')]) * 1.15);
    let teleCoralBot3 = Math.round(parseInt(r3[FIELDS.indexOf('Tele Coral')]) * 1.15);

    let totalL4Coral = 0;
    let totalL3Coral = 0;
    let totalL2Coral = 0;

    let autoL4Coral = 0;
    let autoL2Coral = 0;

    autoL4Coral += parseInt(r1[FIELDS.indexOf('Auto L4')]) + parseInt(r2[FIELDS.indexOf('Auto L4')]) + parseInt(r3[FIELDS.indexOf('Auto L4')]);
    autoL2Coral += parseInt(r1[FIELDS.indexOf('Auto L2')]) + parseInt(r2[FIELDS.indexOf('Auto L2')]) + parseInt(r3[FIELDS.indexOf('Auto L2')]);

    totalL4Coral += autoL4Coral;
    totalL2Coral += autoL2Coral;

    if (parseInt(r1[FIELDS.indexOf('Tele L4')]) > 0 && totalL4Coral < 12) {
        totalL4Coral += teleCoralBot1;
        teleCoralBot1 = 0;
        if (totalL4Coral > 12) {
            teleCoralBot1 = totalL4Coral - 12;
            totalL4Coral = 12;
        }
        if (teleCoralBot1 > 0 && totalL3Coral < 12) {
            totalL3Coral += teleCoralBot1;
            teleCoralBot1 = 0;
            if (totalL3Coral > 12) {
                teleCoralBot1 = totalL3Coral - 12;
                totalL3Coral = 12;
            }
            if (teleCoralBot1 > 0) {
                totalL2Coral += teleCoralBot1;
            }
        }
    } else if (teleCoralBot1 > 0 && totalL3Coral < 12) {
        totalL3Coral += teleCoralBot1;
        teleCoralBot1 = 0;
        if (totalL3Coral > 12) {
            teleCoralBot1 = totalL3Coral - 12;
            totalL3Coral = 12;
        }
        if (teleCoralBot1 > 0) {
            totalL2Coral += teleCoralBot1;
        }
    }

    if (parseInt(r2[FIELDS.indexOf('Tele L4')]) > 0 && totalL4Coral < 12) {
        totalL4Coral += teleCoralBot2;
        teleCoralBot2 = 0;
        if (totalL4Coral > 12) {
            teleCoralBot2 = totalL4Coral - 12;
            totalL4Coral = 12;
        }
        if (teleCoralBot2 > 0 && totalL3Coral < 12) {
            totalL3Coral += teleCoralBot2;
            teleCoralBot2 = 0;
            if (totalL3Coral > 12) {
                teleCoralBot2 = totalL3Coral - 12;
                totalL3Coral = 12;
            }
            if (teleCoralBot2 > 0) {
                totalL2Coral += teleCoralBot2;
            }
        }
    } else if (teleCoralBot2 > 0 && totalL3Coral < 12) {
        totalL3Coral += teleCoralBot2;
        teleCoralBot2 = 0;
        if (totalL3Coral > 12) {
            teleCoralBot2 = totalL3Coral - 12;
            totalL3Coral = 12;
        }
        if (teleCoralBot2 > 0) {
            totalL2Coral += teleCoralBot2;
        }
    }

    if (parseInt(r3[FIELDS.indexOf('Tele L4')]) > 0 && totalL4Coral < 12) {
        totalL4Coral += teleCoralBot3;
        teleCoralBot3 = 0;
        if (totalL4Coral > 12) {
            teleCoralBot3 = totalL4Coral - 12;
            totalL4Coral = 12;
        }
        if (teleCoralBot3 > 0 && totalL3Coral < 12) {
            totalL3Coral += teleCoralBot3;
            teleCoralBot3 = 0;
            if (totalL3Coral > 12) {
                teleCoralBot3 = totalL3Coral - 12;
                totalL3Coral = 12;
            }
            if (teleCoralBot3 > 0) {
                totalL2Coral += teleCoralBot3;
            }
        }
    } else if (teleCoralBot3 > 0 && totalL3Coral < 12) {
        totalL3Coral += teleCoralBot3;
        teleCoralBot3 = 0;
        if (totalL3Coral > 12) {
            teleCoralBot3 = totalL3Coral - 12;
            totalL3Coral = 12;
        }
        if (teleCoralBot3 > 0) {
            totalL2Coral += teleCoralBot3;
        }
    }

    console.log(totalL4Coral);
    console.log(totalL3Coral);
    console.log(totalL2Coral);

    let totalProcessor = parseInt(r1[FIELDS.indexOf('Tele Processor')]) * 0.65 + parseInt(r2[FIELDS.indexOf('Tele Processor')]) * 0.65 + parseInt(r3[FIELDS.indexOf('Tele Processor')]) * 0.65;
    let totalNet = parseInt(r1[FIELDS.indexOf('Tele Net')]) * 1.25 + parseInt(r2[FIELDS.indexOf('Tele Net')]) * 1.25 + parseInt(r3[FIELDS.indexOf('Tele Net')]) * 1.25;
    let totalEndgame = parseInt(r1[FIELDS.indexOf('Endgame Points')]) + parseInt(r2[FIELDS.indexOf('Endgame Points')]) + parseInt(r3[FIELDS.indexOf('Endgame Points')]);

    points = (autoL4Coral * 7) + (9) + (autoL2Coral * 4) + ((totalL4Coral - autoL4Coral) * 5) + (totalL3Coral * 4) + ((totalL2Coral - autoL2Coral) * 3) + (totalProcessor * 2.25) + (totalNet * 4) + (totalEndgame);

    return Math.round(points);
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

function cdfNormal(x, mean, standardDeviation) {
    return (1 - math.erf((mean - x) / (Math.sqrt(2) * standardDeviation))) / 2
}

function getStandardDeviation(arr) {

    // Creating the mean with Array.reduce
    let mean = arr.reduce((acc, curr) => {
        return acc + curr;
    }, 0) / arr.length;

    // Assigning (value - mean) ^ 2 to
    // every array item
    arr = arr.map((k) => {
        return (k - mean) ** 2;
    });

    // Calculating the sum of updated array 
    let sum = arr.reduce((acc, curr) => acc + curr, 0);

    // Calculating the variance
    let variance = sum / arr.length;

    // Returning the standard deviation
    return Math.sqrt(sum / arr.length);
}

function getMean(arr) {

    // Creating the mean with Array.reduce
    let mean = arr.reduce((acc, curr) => {
        return acc + curr;
    }, 0) / arr.length;

    return mean;
}