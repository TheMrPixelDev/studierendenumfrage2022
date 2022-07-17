const raw = await fetch("./umfrage.json")
const json = await raw.json()
const head = json.columns;
const generalData = json.data;

const questions = {
    "1": "In welchem Studiengang bist du immatrikuliert?",
    "2": "In welchem Semester bist du?",
    "3_1": "Wie zufrieden bist du mit dem Mensaangebot?",
    "3_2": "Wie zufrieden bist du mit dem vegetarischen bzw. veganen Angebot in der Mensa?",
    "3_3": "Wie zufrieden bist du mit den Öffnungszeiten der Mensa?",
    "3_4": "Wie zufrieden bist du mit den Öffnungszeiten der Caféten?",
    "3_5": "Wie zufrieden bist du mit der Anzahl der Sitzplätze in der Mensa?",
    "3_6": "Wie zufrieden bist du mit der Anzahl der Sitzplätze in der Bib?",
    "4_1": "Ich habe gut ins Studium reingefunden.",
    "4_2": "Es war mir leicht möglich, einen Freundeskreis aufzubauen.",
    "4_3": "Die Pandemie hat meinen Studienfortschritt erheblich beeinflusst.",
    "5": "Wie genau hat die Pandemie dein Studium beeinflusst?",
    "6_1": "Ich bin mit meinen Vorlesungen zufrieden.",
    "6_2": "Ich habe viel Freizeit außerhalb der Universität.",
    "6_3": "Ich gehe häufig in meine Vorlesungen. (*Selection Bias, da Umfrage in Vorlesungen durchgeführt wurde.)",
    "6_4": "Ich gehe häufig in meine Übungen.",
    "6_5": "Die Dokumente zur Studienplanung der Universität sind übersichtlich.",
    "6_6": "Ich bin zufrieden mit dem Angebot en Lehrveranstaltungen.",
    "7_1": "Ich vermisse es, meine Mensakarte mit Bargeld aufzuladen.",
    "7_2": "Ich denke, es sollte mehr Aufladeautomaten geben.",
    "7_3": "Ich habe mein Studium in der online-Lehre begonnen.",
    "7_4": "Es gibt Themenbereiche, für die ich mir noch Module wünsche.",
    "8": "Zu welchen Themenbereichen wünscht du dir mehr Module",
    "9_1": "Suchst du momentan nach einer Abschlussarbeit?",
    "9_2": "Schreibst du momentan eine Abschlussarbeit?",
    "9_3": "Hast bzw. hattest du Probleme bei der Themenfindung für eine Abschlussarbeit.",
    "9_4": "Wie hast du eine:n Betreuer:in gefunden? Bist du mit der Betreuung zufrieden?",
    "10_1": "Überschneiden sich bei dir Klausurtermine?",
    "10_2": "Hältst du die erteilung der Klausurtermine für fair?",
    "10_3": "Hast du dich rechtzeitig für alle Klausuren angemeldet?",
    "10_4": "Würdest du die Umstellung auf Online-Prüfungen begrüßen?",
    "10_5": "Hast du Erfahrungen mit Portfolio-Prüfungen gemacht?",
    "10_6": "Bedeutet der verkürzte Klausurenanmeldezeitraum eine Einschränkung für dich?",
    "10_7": "Hättest du gerne, dass die Klausurtermine früher angekündigt werden?",
    "11_1": "Woher erhältst du Informationen zur Fachschaft und zu ihren Events?",
    "11_2": "Welche Kommunikationsmittel sollte die Fachschaft (vermehrt) verwenden?",
    "11_3": "Warst du mal bei einer Veranstaltung der Fachschaft außerhalb der O-Woche dabei?",
    "12_1": "(Wie) hast du von der O-Woche erfahren?",
    "12_2": "Welche Angebote der der O-Woche hast du wahrgenommen?"
}

const hiddenQuestions = [11, 22, 34, 35, 36, 37, 38, 39]
const answerMapping1 = {
    "1": "gar nicht zufrieden",
    "2": "nicht zufrieden",
    "3": "neutral",
    "4": "zufrieden",
    "5": "sehr zufrieden"
}

const answerMapping2 = {
    "1": "stimme gar nicht zu",
    "2": "stimme nicht zu",
    "3": "neutral",
    "4": "stimme zu",
    "5": "stimme voll zu"
}

function countAnswersOfQuestion(questionColumn, data) {

    // Gathering every single answer
    const redundantElements = []
    data.forEach(row => {
        redundantElements.push(row[questionColumn])
    })
    let elements = [...new Set(redundantElements)]
    elements = elements.filter(element => {
        return element != null && !(""+element).includes(" ");
    })

    // Counting the occurance of every answer
    let result = []

    elements.forEach(answer => {
        let count = 0;
        data.forEach(row => {
            if(row[questionColumn] == answer) {
                count++;
            }
        })
        result.push(count);
    })

    return { "labels" : elements, "count": result }
}

function filterByColumnValue(searchedSemester, searchedField, data) {
    console.log(searchedField)
    console.log(searchedSemester)
    const filteredData = generalData.filter(row => {
        const fieldOfStudy = ""+row[0];
        const semester = ""+row[1]
        return (fieldOfStudy.includes(searchedField) || searchedField == "20") && (semester == searchedSemester || searchedSemester == "9");
    });
    return filteredData
}

/**
 * Rerenders new Charts, whenever the semester is being changed
 */
const semesterPicker = document.getElementById("chooseSemester");
const fieldPicker = document.getElementById("chooseFieldOfStudy");
const statsDisplay = document.getElementById("stats");

document.getElementById("filterBtn").onclick = () => {
    const semester = semesterPicker.value;
    const field = fieldPicker.value;

    const filterdBySemeserAndField = filterByColumnValue(semester, field, generalData);
    console.log(filterdBySemeserAndField)
    renderDynamicCharts(filterdBySemeserAndField,head)
}

function renderDynamicCharts(filteredData, columnNames) {
    const app = document.getElementById("dynamic");
    app.innerHTML = "";

    statsDisplay.innerText = `Abgegebene Antworten: ${filteredData.length}`
    
    for(let i = 2; i<columnNames.length; i++) {

        if(hiddenQuestions.includes(i)) {continue}

        const result = countAnswersOfQuestion(i, filteredData);
        console.log(result.labels)
        if(i < 8 && i > 1) {
            for(let i = 0; i<result.labels.length; i++) {
                result.labels[i] = answerMapping1[""+result.labels[i]]
            }
        }else if(i >= 8 && i < 18) {
            for(let i = 0; i<result.labels.length; i++) {
                result.labels[i] = answerMapping2[""+result.labels[i]]
            }
        }
        const chartCanvas = document.createElement("canvas");
        const chartStats = document.createElement("p");
        const card = document.createElement("div")
        const cardBody = document.createElement("div")
        const questionTitle = document.createElement("h5")
        questionTitle.innerText = questions[columnNames[i]];
        card.classList = "card mt-3"
        cardBody.classList = "card-body"
        chartStats.innerText = `Antworten: ${result.count.reduce((total, num) => {return total+num;})} Nr: ${i}`;
        chartCanvas.style.width = "100%";
        chartCanvas.classList.add("mt-5")
        const chart = new Chart(chartCanvas.getContext("2d"), {
            type: "doughnut",
            data: {
                labels: result.labels,
                datasets: [
                    {
                        data: result.count,
                        backgroundColor: ["#2959bf", "#d664d3", "#474090", "#ac9ee9", "#752eb0", "#6e1d6c", "#49234a", "#3f3243", "#9bb4ea", "#90c9f4", "#a39ed4"]
                    }
                ]
            },
            options: {
                legend: { 
                    display: true,
                    position: "right",
                    labels: {
                        fontSize: 20
                    }
                }
                /*title: {
                    display: true,
                    text: questions[columnNames[i]],
                    fontSize: 20
                }*/
            }
        })
        cardBody.appendChild(questionTitle)
        cardBody.appendChild(chartCanvas)
        cardBody.appendChild(chartStats)
        card.appendChild(cardBody)
        app.appendChild(card)
    }
    
}

async function renderStaticChart(url, title) {
    const app = document.getElementById("static");
    const res = await fetch(url);
    const json = await res.json();

    const labels = Object.keys(json);
    const values = Object.values(json);
    
    const chartCanvas = document.createElement("canvas");
    const card = document.createElement("div")
    const cardBody = document.createElement("div")
    const questionTitle = document.createElement("h5")
    questionTitle.innerText = title;
    card.classList = "card mt-3"
    cardBody.classList = "card-body"
    chartCanvas.style.width = "100%";
    chartCanvas.classList.add("mt-5")
    const chart = new Chart(chartCanvas.getContext("2d"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: ["#2959bf", "#d664d3", "#474090", "#ac9ee9", "#752eb0", "#6e1d6c", "#49234a", "#3f3243", "#9bb4ea", "#90c9f4", "#a39ed4", "#f39fd4", "#f31faf", "#f39aaa", "#f39a1f"]
                }
            ]
        },
        options: {
            legend: { 
                display: false,
                position: "right",
                labels: {
                    fontSize: 20
                }
            }
            /*title: {
                display: true,
                text: questions[columnNames[i]],
                fontSize: 20
            }*/
        }
    })

    card.appendChild(cardBody);
    cardBody.appendChild(questionTitle);
    cardBody.appendChild(chartCanvas);
    app.appendChild(card)
}

renderStaticChart("./11_1.json", "Woher erhältst du Informationen zur Fachschaft und ihren Events?")
renderDynamicCharts(generalData, head)