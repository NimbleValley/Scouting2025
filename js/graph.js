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