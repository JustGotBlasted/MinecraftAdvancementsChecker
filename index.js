let allAdvancementsData;
let playerData = new Object();
let resultData = new Object();

let showOnlyIncomplete = false;

let totalCompletedAdvancements = 0;
let totalAdvancements = 124;

let backgroundIncompleteImg = {
    "advancement": "https://minecraft.wiki/images/Advancement-plain-raw.png?8e4c1",
    "goal": "https://minecraft.wiki/images/Advancement-oval-raw.png?67998",
    "challenge": "https://minecraft.wiki/images/Advancement-fancy-raw.png?a6443"
};
let backgroundCompletedImg = {
    "advancement": "https://minecraft.wiki/images/Advancement-plain-worn.png?e6de1",
    "goal": "https://minecraft.wiki/images/Advancement-oval-worn.png?f0c30",
    "challenge": "https://minecraft.wiki/images/Advancement-fancy-worn.png?43b68"
}


function loadAllAdvancementsData() {
    return new Promise((resolve, reject) => {
        fetch("./all_advancements.json")
            .then((response) => response.json())
            .then((data) => {
                allAdvancementsData = data;
                resolve("loaded all advancements");
        })
    }) 
}

function resetResultData() {
    for (let id in allAdvancementsData) {
        resultData[id] = new Object();
        resultData[id]["done"] = false;
        resultData[id]["progress"] = 0;
        resultData[id]["criteria"] = new Object();

        for (let criteria_id in allAdvancementsData[id]["criteria"]) {
            resultData[id]["criteria"][criteria_id] = false
        }
    }
}

function updateResultData() {
    resetResultData();

    for (let id in allAdvancementsData) {
        if (!(id in playerData)) {
            continue;
        }

        resultData[id]["done"] = playerData[id]["done"];
        
        for (let criteria_id in allAdvancementsData[id]["criteria"]) {
            if (criteria_id in playerData[id]["criteria"]) {
                resultData[id]["criteria"][criteria_id] = true;
                resultData[id]["progress"]++;
            }
        }
    }
}

function loadGui() {
    let allAdvancementDiv = document.createElement("div");
    allAdvancementDiv.className = "container"
    document.body.querySelector("article").append(allAdvancementDiv);
    
    for (let id in allAdvancementsData) {
        if (showOnlyIncomplete && resultData[id].done) {
            continue;
        }

        let div = document.createElement("div");
        div.id = shortenId(id);
        div.className = resultData[id].done ? "advancement complete" : "advancement incomplete";
        div.style = allAdvancementsData[id]["style"];
        allAdvancementDiv.append(div);

        let infoDiv = document.createElement("div");
        infoDiv.className = "info_div";
        div.append(infoDiv);

        // retrieve icon info
        let iconData = allAdvancementsData[id]["icon"];
        let background = iconData.substring(0, iconData.indexOf(" "));
        let icon = iconData.substring(iconData.indexOf(" ") + 1);

        let iconImg = document.createElement("img");
        iconImg.className = "icon";
        iconImg.src = resultData[id].done ? backgroundCompletedImg[background] : backgroundIncompleteImg[background];
        infoDiv.append(iconImg);

        let itemImg = document.createElement("img");
        itemImg.className = "item_icon";
        itemImg.src = icon;
        infoDiv.append(itemImg);

        let advancementText = document.createElement("p");
        advancementText.className = "name"
        advancementText.textContent = allAdvancementsData[id].name;
        infoDiv.append(advancementText);

        let advancementDescriptionText = document.createElement("p");
        advancementDescriptionText.className = "description";
        advancementDescriptionText.textContent = allAdvancementsData[id]["description"];
        infoDiv.append(advancementDescriptionText);

        if (allAdvancementsData[id]["steps"] > 0) {
            infoDiv.classList.add("info_progress");

            let progressText = document.createElement("p");
            progressText.className = "progress_text";
            progressText.textContent = `${resultData[id]["progress"]}/${allAdvancementsData[id]["steps"]}`;
            infoDiv.append(progressText);

            let progressBar = document.createElement("progress");
            progressBar.className = "progress";
            progressBar.setAttribute("max", allAdvancementsData[id]["steps"]);
            progressBar.setAttribute("value", resultData[id]["progress"]);
            infoDiv.append(progressBar);
        }

        let criteriaDiv = document.createElement("div");
        criteriaDiv.className = "criteria_div";
        div.append(criteriaDiv)
        
        for (let criteria_id in allAdvancementsData[id]["criteria"]) {
            let criteriaText = document.createElement("p");
            criteriaText.className = resultData[id]["criteria"][criteria_id] ? "criteria complete" : "criteria incomplete";
            criteriaText.textContent = allAdvancementsData[id]["criteria"][criteria_id]["description"];
            criteriaDiv.append(criteriaText);
        }
    }
}

async function load() {
    try {
        await loadAllAdvancementsData();
        resetResultData();
        updateResultData();
        loadGui();
    }
    catch(error) {
        console.error(error);
    }
}

function shortenId(id) {
    let newId = id.substring(id.indexOf("/") + 1);

    if (newId === "root") {
        newId = id.substring(id.indexOf(":"));
    }

    return newId
}

function updateTotalAdvancements() {
    totalCompletedAdvancements = 0;

    for (let key in resultData) {
        if (resultData[key]["done"]) {
            totalCompletedAdvancements++;
        }
    }

    let totalProgressText = document.getElementById("total_progress_text");
    let totalProgress = document.getElementById("total_progress");
    totalProgressText.textContent = `${totalCompletedAdvancements}/${totalAdvancements}`;
    totalProgress.setAttribute("value", totalCompletedAdvancements)
}
    

function clearGui() {
    let container = document.querySelector("div.container");
    container.remove();
}

var fileInput = document.getElementById("file_input");
fileInput.addEventListener('change', () => {
    let file = fileInput.files[0];
    if (!file) {
        return;
    }
    
    let reader = new FileReader();
    reader.onload = (event) => {
        try {
            let result = JSON.parse(event.target.result);
            playerData = result;
            updateResultData()
            clearGui();
            loadGui();
            updateTotalAdvancements();
        } catch(error) {
            console.error(error);
            alert("Invalid JSON File");
        }
    }

    reader.readAsText(file);
})

var filter = document.getElementById("filter");
filter.addEventListener('click', () => {
    showOnlyIncomplete = !showOnlyIncomplete;

    if (showOnlyIncomplete) {
        filter.className = "filter_on"
    } else {
        filter.className = "filter_off"
    }
    console.log(showOnlyIncomplete)
    console.log(filter.className)

    clearGui();
    loadGui();
});

load();
