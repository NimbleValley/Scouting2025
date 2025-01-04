
// Creates auto pie chart
function runAutoPie(autoTypes, autoSuccess) {

    let fillColors = ["#D62828", "#F77F00", "#FCBF49", "#9e997b", "#ffffff", "#ffea00"];

    let autoNumbers = [];
    let autoKeys = [];
    let autoWork = [];

    for (var i = 0; i < autoTypes.length; i++) {
        if (!autoKeys.includes(autoTypes[i])) {
            autoKeys.push(autoTypes[i]);
            autoNumbers.push(1);
            autoWork.push(autoSuccess[i]);
        } else {
            autoNumbers[autoKeys.indexOf(autoTypes[i])]++;
            autoWork[autoKeys.indexOf(autoTypes[i])] += autoSuccess[i];
        }
    }

    const canvas = document.getElementById("auto-pie-chart");
    canvas.width = window.innerHeight * (3 / 10);
    canvas.height = window.innerHeight * (3 / 10);
    const ctx = canvas.getContext("2d");

    let percentOn = 0;
    for (var i = 0; i < autoKeys.length; i++) {
        let addFactor = (autoNumbers[i] / parseFloat(autoTypes.length));
        console.log(addFactor);

        let consistencyRate = autoWork[i] / parseFloat(autoNumbers[i]);
        if (consistencyRate < 0.1) {
            consistencyRate = 0.1;
        }

        ctx.beginPath();
        ctx.arc(canvas.width * (1 / 2), canvas.height * (1 / 2), consistencyRate * canvas.height * (1 / 2), percentOn * (Math.PI * 2), (addFactor * (Math.PI * 2)) + (percentOn * (Math.PI * 2)));
        ctx.fillStyle = fillColors[i % 6];
        ctx.lineTo(canvas.width * (1 / 2), canvas.height * (1 / 2));
        ctx.fill();

        percentOn += addFactor;
    }
    ctx.beginPath();

    ctx.lineWidth = window.innerHeight / 200;
    ctx.strokeStyle = "#555555";
    ctx.arc(canvas.width * (1 / 2), canvas.height * (1 / 2), canvas.height * (1 / 2.025), 0, (Math.PI * 2));
    ctx.stroke();

    let tempAutoDescriptionContainer = document.createElement("div");
    tempAutoDescriptionContainer.id = "breakdown-auto-values-container";

    for (var i = 0; i < autoKeys.length; i++) {
        let tempAutoDescription = document.createElement("p");
        tempAutoDescription.className = "auto-breakdown-description";
        tempAutoDescription.innerText = `${decodeAutoKey(autoKeys[i])}: ${autoWork[i]}/${autoNumbers[i]}`;
        tempAutoDescription.style.color = fillColors[i % 6];

        tempAutoDescriptionContainer.appendChild(tempAutoDescription);
    }

    document.getElementById("breakdown-auto-container").appendChild(tempAutoDescriptionContainer);
}

// Decodes the auto key with certain parameters
function decodeAutoKey(key) {
    let output = "";

    if (parseInt(key.substring(1, 2)) != 0) {
        output += `${key.substring(1, 2)} speaker, `
    }

    if (parseInt(key.substring(2, 3)) != 0) {
        output += `${key.substring(2, 3)} amplifier, `
    }

    if (key.includes("M")) {
        output += `Mobility`
    }

    return output;
}

function getBreakdownPercentPie(description, total, made) {

    let tempContainer = document.createElement("div");
    tempContainer.className = "breakdown-percent-container";

    const canvas = document.createElement("canvas");
    canvas.className = "breakdown-percent-canvas";
    canvas.width = window.innerHeight * (12 / 100);
    canvas.height = window.innerHeight * (12 / 100);
    const ctx = canvas.getContext("2d");

    let tempDescription = document.createElement("p");
    tempDescription.className = "breakdown-percent-description";
    tempDescription.innerText = `${description}: ${isNaN(Math.round(made/total*100)) ? "0" : Math.round(made/total*100)}% (${made}/${total})`;
    
    if(total == 0) {
        total = 1;
    }

    addFactor = made/total;

    ctx.beginPath();
    ctx.arc(canvas.width * (1 / 2), canvas.height * (1 / 2), canvas.height * (1 / 2), 0, (addFactor * (Math.PI * 2)));
    ctx.fillStyle = `rgb(${(1.25-addFactor)*255}, ${((addFactor-0.5)*3) * 255}, 0)`;
    ctx.lineTo(canvas.width * (1 / 2), canvas.height * (1 / 2));
    ctx.fill();

    ctx.beginPath();

    ctx.lineWidth = window.innerHeight / 200;
    ctx.strokeStyle = "#555555";
    ctx.arc(canvas.width * (1 / 2), canvas.height * (1 / 2), canvas.height * (1 / 2.025), 0, (Math.PI * 2));
    ctx.stroke();

    tempContainer.appendChild(canvas);
    tempContainer.appendChild(tempDescription);

    return tempContainer;
}