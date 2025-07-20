var graph;
Chart.register(ChartDataLabels);
Chart.defaults.color = '#ffffff';

// Graph functions

function showBarGraph(canvas, sortedGraphColumn, teamsSorted, description) {
    let graphContainer = document.getElementById("graph-canvas-container");

    console.log("Rendering horizontal bar graph.");

    var data = [];

    for (let i = 0; i < sortedGraphColumn.length; i++) {
        data.push({ team: teamsSorted[i], count: sortedGraphColumn[i] })
    }

    data = data.reverse();

    console.log(data.length);

    graphContainer.style.height = `${data.length * 6.5}vh`;

    const config = {
        type: 'bar',
        data: {
            labels: data.map(row => row.team),
            datasets: [
                {
                    label: description,
                    data: data.map(row => row.count),
                    backgroundColor: 'rgb(189, 95, 33)',
                    color: "#ffffff"
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    color: "#ffffff"
                }
            }
        },
    };

    graph = new Chart(canvas, config);
    return graph;
}

function showScatterChart(canvas, teamData2d, description) {
    resizeGraph();

    teamData2d = mergeScatterData(teamData2d);

    console.log("Rendering scatter graph.");

    const data = teamData2d;

    const config = {
        type: 'scatter',
        data: {
            labels: data.map(x => x.team),
            datasets: [
                {
                    label: "Teams",
                    data: data.map(row => ({
                        label: row.team,
                        x: row.x,
                        y: row.y
                    })),
                    pointRadius: window.innerHeight / 100,
                    backgroundColor: 'rgb(189, 95, 33)'
                }
            ]
        },
        options: {
            legend: { display: false },
            scales: {
                x: {
                    ticks: {
                        callback: value => `${value / 1}`,
                        color: "#ababab"
                    },
                    title: {
                        display: true,
                        text: description[0],
                        color: "#FFFFFF"
                    },
                    grid: {
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: true,
                        color: "#7d7d7d"
                    }
                },
                y: {
                    ticks: {
                        callback: value => `${value / 1}`,
                        color: "#ababab"
                    },
                    title: {
                        display: true,
                        text: description[1],
                        color: "#FFFFFF"
                    },
                    grid: {
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: true,
                        color: "#7d7d7d"
                    }
                }
            },
            plugins: {
                // Change options for ALL labels of THIS CHART
                datalabels: {
                    color: '#ffffff',
                    align: 'top'
                }
            }
        }
    };

    graph = new Chart(canvas, config);

    console.log(window.innerHeight)
    //graph.resize(window.innerHeight * 1.75, window.innerWidth * 0.4);

    // Refer to https://github.com/chartjs/Chart.js/discussions/10742 to add hover effect

    return graph;
}

function showMatrixGraph(canvas, teamData, matchNumbers, includedFields, description) {
    resizeGraph();

    console.log("Rendering consistency matrix graph.");

    console.log(includedFields)

    const scales = {
        x: {
            type: 'category',
            labels: matchNumbers,
            ticks: {
                display: true
            },
            grid: {
                display: false
            }
        },
        y: {
            type: 'category',
            labels: includedFields,
            offset: true,
            ticks: {
                display: true
            },
            grid: {
                display: false
            }
        }
    }
    const options = {
        plugins: {
            legend: false,
            tooltip: {
                callbacks: {
                    title() {
                        return '';
                    },
                    label(context) {
                        // Bob
                        //alert('bob');
                        // Why won't bob alert me :(

                        // Update: bob alerts now, I had two plugin keys smh 
                        const v = context.dataset.data[context.dataIndex];
                        return ['d: ' + v.v];
                    }
                }
            },
            datalabels: {
                color: '#ffffff',
                align: 'top',
                display: false
            }
        },
        scales: scales
    };

    const data = {
        datasets: [{
            data: teamData,
            label: "TEST",
            backgroundColor({ raw }) {
                const alpha = (10 + raw.v) / 60;
                return `rgba(0, 255, 0, ${raw.index})`;
            },
            borderColor({ raw }) {
                const alpha = (10 + raw.v) / 60;
                return alpha;
            },
            borderWidth: 1,
            hoverBackgroundColor: 'yellow',
            hoverBorderColor: 'yellowgreen',
            width: ({ chart }) => (chart.chartArea || {}).width / chart.scales.x.ticks.length - 3,
            height: ({ chart }) => (chart.chartArea || {}).height / chart.scales.y.ticks.length - 3
        }]
    };

    const config = {
        type: 'matrix',
        data: data,
        options: options
    };

    graph = new Chart(canvas, config);
}

function showConsistencyLineGraph(canvas, matches, values, teams) {
    //let graphContainer = document.getElementById("graph-canvas-container");

    console.log("Rendering consistency line graph.");

    let matchData = [];

    for (let i = 0; i < matches.length; i++) {
        matchData.push({ x: matches[i], y: values[i] })
    }

    const data = {
        labels: matches,
        datasets: [{
            data: values,
            label: teams[0]
        }]
    };

    const config = {
        type: 'line',
        data: data
    };

    if (window.innerHeight > window.innerWidth) {
        //graphContainer.style.width = `85vw`;
    }

    return new Chart(canvas, config);
}

// Helper functions

function mergeScatterData(teamData2d) {
    let xValues = [];
    let yValues = [];
    let labels = [];

    for (let i = 0; i < teamData2d.length; i++) {
        let specialCase = false;
        if (xValues.includes(teamData2d[i].x)) {
            for (let s = 0; s < xValues.length; s++) {
                if (!specialCase && xValues[s] == teamData2d[i].x && yValues[s] == teamData2d[i].y) {
                    specialCase = true;
                    labels[s] += ",\n" + teamData2d[i].team;
                }
            }
        }
        if (!specialCase) {
            labels.push(teamData2d[i].team);
            xValues.push(teamData2d[i].x);
            yValues.push(teamData2d[i].y);
        }
    }

    let formattedArray = [];
    for (let i = 0; i < xValues.length; i++) {
        formattedArray.push({
            team: labels[i],
            x: xValues[i],
            y: yValues[i]
        })
    }

    console.log(formattedArray);

    return formattedArray;
}

function resizeGraph() {
    let graphContainer = document.getElementById("graph-canvas-container");

    graphContainer.style.width = `calc(95vw-35vh)`;
    graphContainer.style.height = `85vh`;
}

function terminateGraph(tempGraph) {
    if (tempGraph != null) {
        tempGraph.destroy();
    }
}

function showPieGraph(canvas, values, labels, title) {

    console.log("Rendering pie graph.");

    const data = {
        labels: labels,
        datasets: [{
            label: 'Corals',
            data: values,
            backgroundColor: [
                'rgb(128, 9, 25)',
                'rgb(245, 66, 176)',
                'rgb(161, 66, 245)',
                'rgb(66, 78, 245)'
            ],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const options = {
        plugins: {
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    font: {
                        size: 10
                    },
                    // Adjust padding around labels
                    padding: 5,
                    // Adjust box width 
                    boxWidth: 10,
                },
            },
            tooltip: {
                titleFont: {
                    size: 15
                },
                bodyFont: {
                    size: 15
                }
            },
            title: {
                display: true,
                text: title
            }
        }
    };

    const config = {
        type: 'pie',
        data: data,
        options: options
    };

    if (window.innerHeight > window.innerWidth) {
        //graphContainer.style.width = `85vw`;
    }

    return new Chart(canvas, config);
}











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
    for (let i = 1; i < TEAM_FIELDS_ORDER.length; i++) {
        let op = document.createElement("option");
        op.text = TEAM_FIELDS_ORDER[i];
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
    for (var i = 1; i < TEAM_FIELDS_ORDER.length; i++) {
        var op = document.createElement("option");
        op.text = TEAM_FIELDS_ORDER[i];
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

    let dataType = 'mean';

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
    var sortedGraphColumn = JSON.parse(JSON.stringify(TEAM_COLUMNS[dataType]));

    switch (graphMode) {
        case 1:
            document.getElementById("graph-category-select").style.display = "block";
            sortedGraphColumn = sortedGraphColumn[graphColumn].sort(function (a, b) { return a - b });

            // Sorted teams
            var teamsSorted = [];
            console.log(TEAM_ROWS[dataType])
            for (let i = 0; i < sortedGraphColumn.length; i++) {
                for (let t = 0; t < TEAM_ROWS[dataType].length; t++) {
                    if (TEAM_ROWS[dataType][t][graphColumn] == sortedGraphColumn[i] && !teamsSorted.includes(TEAM_ROWS[dataType][t][0])) {
                        teamsSorted.push(TEAM_ROWS[dataType][t][0]);
                        console.log(i);
                        break;
                    }
                }
            }
            graphTabGraph = showBarGraph(graphCanvas, sortedGraphColumn, teamsSorted, TEAM_FIELDS_ORDER[graphColumn]);
            break;
        case 2:
            document.getElementById("graph-category-select-two").style.display = "block";
            document.getElementById("graph-category-select").style.display = "block";
            var secondGraphColumn = document.getElementById("graph-category-select-two").value;
            let secondSortedGraphColumn = JSON.parse(JSON.stringify(TEAM_COLUMNS[dataType]));
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
            graphTabGraph = showScatterChart(graphCanvas, teamData2d, [TEAM_FIELDS_ORDER[graphColumn], TEAM_FIELDS_ORDER[secondGraphColumn]]);
            break;
        case 4:
            document.getElementById("graph-category-select").style.display = "none";
            document.getElementById("graph-category-select-team").style.display = "block";
            let tempData = [];
            let tempTeamRows = [];

            let selectedTeam = document.getElementById("graph-category-select-team").value;
            let matchesSorted = [];

            for (let i = 0; i < RAW_ROWS.length; i++) {
                if (parseInt(RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('teamNumber')]) == parseInt(selectedTeam)) {
                    // Filters to only numerical data
                    let filteredRecord = [];
                    for (let f = 0; f < RAW_ROWS[i].length; f++) {
                        if (TEAM_FIELDS_ORDER.includes(RAW_FIELDS_ORDER[f])) {
                            filteredRecord.push(RAW_ROWS[i][f]);
                        }
                    }
                    tempTeamRows.push(filteredRecord);
                    // TODO: CHANGE TO MATCH NUMBER COLUMN IN 2024
                    matchesSorted.push(RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('matchNumber')]);
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
            let includedFields = JSON.parse(JSON.stringify(TEAM_FIELDS_ORDER));

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

            for (let i = 0; i < RAW_ROWS.length; i++) {
                if (parseInt(RAW_ROWS[i][0]) == parseInt(teamSelect.value) && !matches.includes(RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('matchNumber')])) {
                    matches.push(parseInt(RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf('matchNumber')]));
                    teamFields.push(RAW_ROWS[i][RAW_FIELDS_ORDER.indexOf(TEAM_FIELDS_ORDER[parseInt(valueSelect.value)])]);
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