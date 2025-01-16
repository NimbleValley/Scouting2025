// Sets up compare tab
function setUpCompare() {
    getTeamData();

    rawTable.innerHTML = "";
    graphContainer.style.display = "none";
    pickListContainer.style.display = "none";

    let compareContainer = document.createElement("div");
    compareContainer.id = "compare-container";

    let compareHeaderContainer = document.createElement("div");
    compareHeaderContainer.id = "compare-header-container";

    let teamSelects = [];
    let teamButtons = [];
    for (var i = 0; i < 2; i++) {
        let tempTeamSelect = document.createElement("select");
        tempTeamSelect.className = "compare-team-select";
        let tempButton = document.createElement('button');
        for (var t = 0; t < TEAMS.length; t++) {
            let tempOption = document.createElement("option");
            tempOption.value = String(TEAMS[t]);
            tempOption.text = TEAMS[t];
            tempTeamSelect.appendChild(tempOption);

            tempButton.dataset.team = TEAMS[t];
            tempButton.dataset.id = i;
            tempButton.innerText = 'View';
            
        }
        tempButton.addEventListener('click', function(e) {
            localStorage.setItem('breakdown-team', localStorage.getItem(`compare-team-${this.dataset.id}`));
            setUpTeamBreakdowns();
            e.preventDefault();
        });
        if (localStorage.getItem(`compare-team-${i}`) != null && localStorage.getItem(`compare-team-${i}`) != "") {
            tempTeamSelect.value = localStorage.getItem(`compare-team-${i}`);
            tempButton.dataset.team = localStorage.getItem(`compare-team-${i}`);
        }
        tempButton.style.scale = 0.7;
        teamSelects.push(tempTeamSelect);
        teamButtons.push(tempButton);
        tempTeamSelect.addEventListener("change", function () { doCompare(teamSelects, statContainers) });

        let tempContainer = document.createElement('div');
        tempContainer.style.display = 'flex';
        tempContainer.style.justifyContent = 'space-around';
        tempContainer.style.flexDirection = 'column';

        tempContainer.appendChild(tempTeamSelect);
        tempContainer.appendChild(tempButton);

        compareHeaderContainer.appendChild(tempContainer);
    }

    let compareDescriptionContainer = document.createElement("div");
    compareDescriptionContainer.innerHTML = `<p style="font-weight: bold">Categories</p>`;
    compareDescriptionContainer.id = "compare-description-container";
    compareHeaderContainer.insertBefore(compareDescriptionContainer, compareHeaderContainer.childNodes[1]);

    let statContainers = [];
    for (let i = 0; i < TEAM_FIELDS.length - 1; i++) {
        let tempStat = document.createElement("div");
        tempStat.className = "stat-compare-container";

        for (let t = 0; t < 2; t++) {
            let tempStatNumber = document.createElement("p");
            tempStatNumber.className = "compare-stat-number";
            tempStatNumber.innerText = "?";
            tempStat.appendChild(tempStatNumber);
        }

        let tempLineContainer = document.createElement("div");
        tempLineContainer.className = "compare-line-container";

        tempStatName = document.createElement("p");
        tempStatName.className = "compare-stat-description";
        tempStatName.innerText = TEAM_FIELDS[i + 1];
        tempLineContainer.appendChild(tempStatName);

        tempStat.insertBefore(tempLineContainer, tempStat.childNodes[1]);

        for (var l = 0; l < 2; l++) {
            let tempInnerLine = document.createElement("div");
            tempInnerLine.className = "compare-inner-line";
            tempLineContainer.appendChild(tempInnerLine);
        }

        compareContainer.appendChild(tempStat);
        statContainers.push(tempStat);
    }

    compareContainer.appendChild(compareHeaderContainer);
    rawTable.appendChild(compareContainer);

    doCompare(teamSelects, statContainers);
}

// Runs compare tab
function doCompare(teamSelects, statContainers) {
    let teamIndices = [];

    for (let i = 0; i < teamSelects.length; i++) {
        localStorage.setItem(`compare-team-${i}`, teamSelects[i].value);
        console.log(localStorage.getItem(`compare-team-${i}`));
        teamIndices.push(TEAMS.indexOf(parseInt(teamSelects[i].value)));
    }

    console.log(teamIndices);

    for (let i = 0; i < statContainers.length; i++) {
        let teamStats = [];

        let tempNumbers = statContainers[i].getElementsByClassName("compare-stat-number");

        for (let t = 0; t < tempNumbers.length; t++) {
            tempNumbers[t].innerText = TEAM_COLUMNS[i + 1][teamIndices[t]];

            if (TEAM_COLUMNS[i + 1][teamIndices[t]] == 0) {
                teamStats.push(0.1);
            } else {
                teamStats.push(TEAM_COLUMNS[i + 1][teamIndices[t]]);
            }
        }

        if (teamStats[0] < 0) {
            teamStats[1] += Math.abs(teamStats[0]);
            teamStats[0] = 0.1;
        }

        if (teamStats[1] < 0) {
            teamStats[0] += Math.abs(teamStats[1]);
            teamStats[1] = 0.1;
        }

        for (let l = 0; l < 2; l++) {
            let tempLine = statContainers[i].getElementsByClassName("compare-inner-line")[l];
            let minStat = JSON.parse(JSON.stringify(teamStats)).sort(function (a, b) { return b - a })[1];
            let width = (teamStats[l] / minStat) * 50;
            if (width >= 95) {
                width = 95;
            }
            if (badCompareValues.includes(i)) {
                if (width > 50) {
                    tempLine.style.zIndex = 0;
                    tempNumbers[l].style.backgroundColor = "transparent";
                    tempNumbers[l].style.fontWeight = "normal";
                    tempNumbers[l].style.textShadow = "none";
                    tempLine.classList = "compare-inner-line";
                    tempNumbers[l].style.border = "solid 0.5vh transparent";
                    //tempLine.classList.add(`compare-pulse-${l}`);
                } else {
                    tempLine.style.zIndex = 10;
                    tempNumbers[l].style.backgroundColor = `rgba(50, 205, 50, ${(width - 50) / 50})`;
                    tempNumbers[l].style.border = "solid 0.5vh limegreen";
                    tempNumbers[l].style.fontWeight = "bold";
                    tempNumbers[l].style.textShadow = "lime 0px 0px 0.75vh";
                }
            } else {
                if (width > 50) {
                    tempLine.style.zIndex = 10;
                    tempNumbers[l].style.backgroundColor = `rgba(50, 205, 50, ${(width - 50) / 50})`;
                    tempNumbers[l].style.border = "solid 0.5vh limegreen";
                    tempNumbers[l].style.fontWeight = "bold";
                    tempNumbers[l].style.textShadow = "lime 0px 0px 0.75vh";
                    //tempLine.classList.add(`compare-pulse-${l}`);
                } else {
                    tempLine.style.zIndex = 0;
                    tempNumbers[l].style.backgroundColor = "transparent";
                    tempNumbers[l].style.fontWeight = "normal";
                    tempNumbers[l].style.textShadow = "none";
                    tempLine.classList = "compare-inner-line";
                    tempNumbers[l].style.border = "solid 0.5vh transparent";
                }
            }
            if (teamStats[0] == teamStats[1]) {
                console.log(width);
                tempLine.style.zIndex = 0;
                tempNumbers[l].style.backgroundColor = "#3d8eff";
                tempNumbers[l].style.fontWeight = "bold";
                tempNumbers[l].style.textShadow = "#006aff 0px 0px 0.75vh";
                tempNumbers[l].style.border = "solid 0.5vh #3d8eff";
            }
            tempLine.style.width = `${width}%`;

            if (l == 1) {
                tempLine.style.right = 0;
                tempLine.style.backgroundColor = "#ffc400";
                tempLine.style.borderTopRightRadius = "100000px";
                tempLine.style.borderBottomRightRadius = "100000px";
            } else {
                tempLine.style.borderTopLeftRadius = "100000px";
                tempLine.style.borderBottomLeftRadius = "100000px";
            }
        }
    }
}