const searchForm = document.querySelector("form");
searchForm.addEventListener("submit", search);
function search(event) {
    event.preventDefault();
    const searchTerm = document.querySelector("#search-input").value;
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${searchTerm}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error fetching data");
            }
            return response.json();
        })
        .then(data => {
            displayResults(data);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            displayResults(data);

        });
}


function displayResults(data) {
    const meanings = data[0].meanings;
    const resultsList = document.querySelector("#results-list");
    resultsList.innerHTML = "";
    for (let i = 0; i < meanings.length; i++) {

        const meaning = meanings[i];
        const partOfSpeech = meaning.partOfSpeech;
        const definitions = meaning.definitions;
        const meaningItem = document.createElement("li");
        meaningItem.classList.add("meaning");
        const partOfSpeechHeading = document.createElement("h2");
        partOfSpeechHeading.textContent = partOfSpeech;
        meaningItem.appendChild(partOfSpeechHeading);
        for (let j = 0; j < definitions.length; j++) {

            const definition = definitions[j];
            const definitionItem = document.createElement("li");
            definitionItem.classList.add("definition");
            const definitionText = document.createElement("p");
            definitionText.textContent = definition.definition;
            definitionItem.appendChild(definitionText);
            if (definition.example) {
                const exampleText = document.createElement("p");
                exampleText.textContent = `Example: ${definition.example}`;
                definitionItem.appendChild(exampleText);
            }
            meaningItem.appendChild(definitionItem);
        }
        resultsList.appendChild(meaningItem);
    }

    const suggestions = getSuggestions(searchTerm);
    displaySuggestions(suggestions);
}

function getSuggestions(word) {
    const MAX_DISTANCE = 2;

    return fetch('dictionary.json')
        .then(response => response.json())
        .then(data => {
            const wordsList = data.map(entry => entry.word);
            const suggestions = [];

            for (let i = 0; i < wordsList.length; i++) {
                const currentWord = wordsList[i];
                const distance = calculateEditDistance(word, currentWord);
                if (distance <= MAX_DISTANCE) {
                    suggestions.push(currentWord);
                }
            }

            return suggestions;
        })
        .catch(error => {
            console.error("Error loading dictionary:", error);
            return [];
        });
}


function calculateEditDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    const costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

function displaySuggestions(suggestions) {
    const resultsList = document.querySelector("#results-list");
    resultsList.innerHTML = '';
    if (!suggestions || suggestions.length === 0) {
        const message = document.createElement('li');
        message.textContent = "No suggestions found.";
        resultsList.appendChild(message);
    } else {
        for (let i = 0; i < suggestions.length; i++) {
            const suggestion = suggestions[i];
            const suggestionItem = document.createElement('li');
            suggestionItem.textContent = suggestion;
            suggestionItem.addEventListener('click', () => {
                document.querySelector('#search-input').value = suggestion;
                search(new Event('submit'));
            });
            resultsList.appendChild(suggestionItem);
        }
    }
}






