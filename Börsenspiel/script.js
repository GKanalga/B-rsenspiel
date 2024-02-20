let portfolio = {
    startkapital: 10000,
    barvermoegen: 0,
    aktien: {}
};

const aktien = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
    { symbol: 'FB', name: 'Facebook, Inc.' },
    { symbol: 'BRK.A', name: 'Berkshire Hathaway Inc.' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
    { symbol: 'WMT', name: 'Walmart Inc.' },
    { symbol: 'PG', name: 'Procter & Gamble Company' },
    { symbol: 'TSLA', name: 'Tesla, Inc.' },
    { symbol: 'MA', name: 'Mastercard Incorporated' },
    { symbol: 'DIS', name: 'The Walt Disney Company' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'HD', name: 'The Home Depot, Inc.' },
    { symbol: 'NFLX', name: 'Netflix, Inc.' },
    { symbol: 'BA', name: 'The Boeing Company' },
    { symbol: 'VZ', name: 'Verizon Communications Inc.' },
    { symbol: 'INTC', name: 'Intel Corporation' },
    { symbol: 'PFE', name: 'Pfizer Inc.' },
    { symbol: 'CSCO', name: 'Cisco Systems, Inc.' },
    { symbol: 'KO', name: 'The Coca-Cola Company' },
    { symbol: 'PEP', name: 'PepsiCo, Inc.' },
    { symbol: 'ORCL', name: 'Oracle Corporation' }
];

// Event-Handler, der beim Laden des Fensters ausgeführt wird. Ruft mehrere Initialisierungsfunktionen auf.
window.onload = () => {
    ladePortfolio();
    initialisiereSpiel();
    testApi();
    initialiseDropdown();
};


// Initialisiert das Spiel, indem es das Startkapital aus dem HTML-Element liest und dem Portfolio zuweist.
function initialisiereSpiel() {
    let eingegebenesKapital = parseInt(document.getElementById('startkapital').value);
   // Prüft, ob das eingegebene Kapital eine gültige Zahl ist und größer als 0.
    if (!isNaN(eingegebenesKapital) && eingegebenesKapital > 0) {
        portfolio.startkapital = eingegebenesKapital;
        portfolio.barvermoegen = eingegebenesKapital;
         portfolio.aktien = {};
        document.getElementById('aktienkapital').textContent = '0.00';
        aktualisiereUI();
    } else {
        alert('Bitte geben Sie ein gültiges Startkapital ein.');
    }
}


// Initialisiert das Dropdown-Menü mit verfügbaren Aktien.
function initialiseDropdown() {
    const aktienAuswahl = document.getElementById('aktienAuswahl');
    aktien.forEach(aktie => {
        let option = new Option(aktie.name, aktie.symbol);
        aktienAuswahl.appendChild(option);
    });
}
// API-Schlüssel für die Aktienpreis-Abfrage.
const apiKey = 'RJQ0ZYJYKCSKYZRB'; 


// Asynchrone Funktion, die den aktuellen Preis einer Aktie anhand ihres Symbols lädt.
async function ladeAktienPreis(aktienSymbol) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${aktienSymbol}&apikey=RJQ0ZYJYKCSKYZRB`;

    try {
        const response = await fetch(url);
        const data = await response.json();
   // Prüft, ob die Antwort gültige Daten enthält und gibt den letzten Schlusskurs zurück.

        if (data && data['Time Series (Daily)']) {
            let lastRefreshed = data['Meta Data']['3. Last Refreshed'];
            let latestData = data['Time Series (Daily)'][lastRefreshed];
            return latestData ? parseFloat(latestData['4. close']) : null;
        } else {
            console.error('Keine Daten für das angegebene Symbol gefunden: ', aktienSymbol);
            return null;
        }
    } catch (error) {
        console.error('Fehler beim Laden der Aktienpreise:', error);
        return null;
    }
    console.log('API-Antwort:', data);

}

// Asynchrone Funktion zum Kauf von Aktien.
async function kaufen() {

    // Liest die ausgewählte Aktie und die Anzahl der zu kaufenden Aktien aus dem HTML-Dokument.
    let aktienName = document.getElementById('aktienAuswahl').value;
    let anzahl = parseInt(document.getElementById('aktienAnzahl').value);
    // Überprüft, ob die eingegebene Anzahl gültig ist.

    if (isNaN(anzahl) || anzahl <= 0) {
        alert('Bitte geben Sie eine gültige Anzahl ein.');
        return;
    }

        // Ruft den aktuellen Preis der ausgewählten Aktie ab.
    let aktienPreis = await ladeAktienPreis(aktienName);

        // Überprüft, ob der Aktienpreis erfolgreich geladen wurde.
    if (aktienPreis === null) {
        alert('Aktienpreis konnte nicht geladen werden.');
        return;
    }
    
        // Berechnet den Gesamtpreis für den Kauf.
    let gesamtpreis = aktienPreis * anzahl;

        // Überprüft, ob genügend Barvermögen für den Kauf vorhanden ist.
    if (portfolio.barvermoegen >= gesamtpreis) {
                // Aktualisiert das Portfolio nach dem Kauf.
        portfolio.barvermoegen -= gesamtpreis;
        portfolio.aktien[aktienName] = (portfolio.aktien[aktienName] || 0) + anzahl;

                // Protokolliert die Transaktion und aktualisiert die Benutzeroberfläche.
        protokolliereTransaktion(aktienName, anzahl, aktienPreis, 'kaufen');
        aktualisiereUI();
        speicherePortfolio();
    } else {
        alert('Nicht genug Geld für diesen Kauf!');
    }
}

// Funktionen zum Öffnen und Schließen des Portfolio-Modals.
function öffnePortfolioModal() {
    document.getElementById('portfolioModal').style.display = "block";
    aktualisierePortfolioDetails();
}

function schließePortfolioModal() {
    document.getElementById('portfolioModal').style.display = "none";
}

// Asynchrone Funktion zur Aktualisierung der Detailansicht des Portfolios.
async function aktualisierePortfolioDetails() {
     let aktienListeDiv = document.getElementById('aktienListe');
    aktienListeDiv.innerHTML = ''; // Leert die bisherigen Inhalte der Liste.


    let gesamtwert = 0; // Variable zum Speichern des Gesamtwerts der Aktien.

    // Durchläuft jede Aktie im Portfolio.
     for (const [symbol, anzahl] of Object.entries(portfolio.aktien)) {
        if (anzahl > 0) {// Verarbeitet nur, wenn Aktien vorhanden sind.
            try {
                 let aktuellerPreis = await ladeAktienPreis(symbol);
                gesamtwert += aktuellerPreis * anzahl;

                 // Erstellt ein Element für jede Aktie und fügt es der Liste hinzu.
                 let aktienItem = document.createElement('p');
                aktienItem.textContent = `${symbol}: ${anzahl} Stück @ ${aktuellerPreis.toFixed(2)} (Gesamt: ${(aktuellerPreis * anzahl).toFixed(2)})`;
                aktienListeDiv.appendChild(aktienItem);
            } catch (error) {
                console.error(`Fehler beim Abrufen der Daten für ${symbol}: `, error);
            }
        }
    }

       // Aktualisiert das Element zur Anzeige des Gesamtwerts der Aktien.
    document.getElementById('aktienkapital').textContent = gesamtwert.toFixed(2);

    
 } 
// Asynchrone Funktion zur Aktualisierung des Gesamtwerts des Aktienkapitals.
async function aktualisiereAktienkapital() {
    let gesamtesAktienkapital = 0;
    let fehler = false;
    
        // Führt parallele Anfragen zur Preisaktualisierung für jede Aktie im Portfolio durch.
    const preisUpdates = Object.keys(portfolio.aktien).map(async (aktienSymbol) => {
        let anzahl = portfolio.aktien[aktienSymbol];
        if (anzahl > 0) {
            try {
                let aktienPreis = await ladeAktienPreis(aktienSymbol);
                gesamtesAktienkapital += aktienPreis * anzahl;
            } catch (error) {
                fehler = true;
                console.error(`Fehler beim Laden des Preises für ${aktienSymbol}: `, error);
            }
        }
    });

     // Wartet, bis alle Preisaktualisierungen abgeschlossen sind.
    await Promise.all(preisUpdates);


        // Aktualisiert die Anzeige des Gesamtwerts des Aktienkapitals, wenn keine Fehler aufgetreten sind.
    if (!fehler) {
        document.getElementById('aktienkapital').textContent = gesamtesAktienkapital.toFixed(2);
    } else {
        alert('Es gab ein Problem beim Aktualisieren des Aktienkapitals.');
    }
}

// Asynchrone Funktion zum Verkauf von Aktien.
async function verkaufen() {
    let aktienName = document.getElementById('aktienAuswahl').value;
    let anzahl = parseInt(document.getElementById('aktienAnzahl').value);

        // Überprüft, ob die eingegebene Anzahl gültig ist.
     if (isNaN(anzahl) || anzahl <= 0) {
        alert('Bitte geben Sie eine gültige Anzahl ein.');
        return;
    }
    // Überprüft, ob der Spieler genügend Aktien zum Verkaufen hat.
     if (!portfolio.aktien[aktienName] || portfolio.aktien[aktienName] < anzahl) {
        alert('Sie besitzen nicht genügend Aktien dieser Art zum Verkaufen.');
        return;
    }
    // Lädt den aktuellen Aktienpreis.
     let aktienPreis = await ladeAktienPreis(aktienName);
    if (aktienPreis === null) {
        alert('Aktienpreis konnte nicht geladen werden.');
        return;
    }
    // Aktualisiert das Portfolio nach dem Verkauf.
     portfolio.aktien[aktienName] -= anzahl;
    portfolio.barvermoegen += aktienPreis * anzahl;

        // Protokolliert die Transaktion und aktualisiert die Benutzeroberfläche.
     protokolliereTransaktion(aktienName, anzahl, aktienPreis, 'verkaufen');
    aktualisiereUI();
    speicherePortfolio();
}

// Funktion zum Protokollieren von Transaktionen.
function protokolliereTransaktion(aktienName, anzahl, preis, aktion) {
    let jetzt = new Date();
    let zeitstempel = jetzt.toLocaleString();// Erstellt einen Zeitstempel für die Transaktion.
    let logEintrag = document.createElement('li');// Erstellt ein neues Listenelement für den Log-Eintrag.
    logEintrag.textContent = `${zeitstempel} - Aktion: ${aktion}, Aktie: ${aktienName}, Anzahl: ${anzahl}, Preis: ${preis.toFixed(2)}, Barvermögen: ${portfolio.barvermoegen.toFixed(2)}`;
    document.getElementById('transaktionen').appendChild(logEintrag);
}

// Funktion zur Aktualisierung der Benutzeroberfläche.
function aktualisiereUI() {
    document.getElementById('barvermoegen').textContent = portfolio.barvermoegen.toFixed(2);
}


// Asynchrone Funktion zum Anzeigen eines Popups mit dem Aktienkurs.
async function anzeigenAktienkursPopup() {
    let aktienSymbol = document.getElementById('aktienAuswahl').value;
    let aktuellerKurs = await ladeAktienPreis(aktienSymbol);
    let historischeDaten = await ladeHistorischeDaten(aktienSymbol);

        // Überprüft, ob aktueller Kurs und historische Daten erfolgreich geladen wurden.
    if (aktuellerKurs === null || historischeDaten === null) {
        alert("Fehler beim Laden der Aktieninformationen.");
        return;
    }


        // Stellt den Titel des Modals und den Chart mit den historischen Daten ein.
     document.getElementById('modalTitle').textContent = `Aktueller Kurs von ${aktienSymbol}: ${aktuellerKurs}`;

     let canvas = document.getElementById('kursChart');
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: historischeDaten.labels,
            datasets: [{
                label: 'Kurs',
                data: historischeDaten.data
            }]
        }
    });

        // Zeigt das Modal an.
     let modal = document.getElementById('kursModal');
    modal.style.display = "block";

        // Schließt das Modal bei Klick auf das Schließkreuz oder außerhalb des Modals.
     let span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
        modal.style.display = "none";
         if (window.chart) {
            window.chart.destroy();
        }
    }

     window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            if (window.chart) {
                window.chart.destroy();
            }
        }
    }
}
// Asynchrone Funktion zum Laden historischer Daten einer Aktie.
async function ladeHistorischeDaten(aktienSymbol) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${aktienSymbol}&apikey=RJQ0ZYJYKCSKYZRB&outputsize=compact`;

    try {
                // Sendet eine HTTP-Anfrage an die API, um historische Daten zu erhalten.
        const response = await fetch(url);
        const data = await response.json();

                // Überprüft, ob historische Daten vorhanden sind.
        if (data['Time Series (Daily)']) {
            const timeSeries = data['Time Series (Daily)'];

             let labels = [];     // Array für die Datumslabels des Charts.
            let kursDaten = [];   // Array für die Kursdaten.


             let count = 0;

                         // Durchläuft die historischen Daten und fügt sie den Arrays hinzu.
            for (let date in timeSeries) {
                if (count >= 120) break;// Begrenzt die Daten auf die letzten 120 Tage.  
                labels.unshift(date); // Fügt das Datum dem labels-Array vorne an.
                kursDaten.unshift(timeSeries[date]['4. close']); // Fügt den Schlusskurs dem kursDaten-Array vorne an.
                count++;
            }

            return { labels: labels, data: kursDaten }; // Gibt die vorbereiteten Daten für die Chart-Darstellung zurück.
   
        } else {
            throw new Error('Keine historischen Daten verfügbar.');
        }
    } catch (error) {
                // Protokolliert Fehler beim Laden der historischen Daten.
        console.error('Fehler beim Laden der historischen Daten:', error);
        return null;
    }
}

// Funktion zum Initialisieren des Dropdown-Menüs mit den Aktien.

function initialiseDropdown() {
    const aktienAuswahl = document.getElementById('aktienAuswahl');
    const aktien = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
    { symbol: 'FB', name: 'Facebook, Inc.' },
    { symbol: 'BRK.A', name: 'Berkshire Hathaway Inc.' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
    { symbol: 'WMT', name: 'Walmart Inc.' },
    { symbol: 'PG', name: 'Procter & Gamble Company' },
    { symbol: 'TSLA', name: 'Tesla, Inc.' },
    { symbol: 'MA', name: 'Mastercard Incorporated' },
    { symbol: 'DIS', name: 'The Walt Disney Company' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'HD', name: 'The Home Depot, Inc.' },
    { symbol: 'NFLX', name: 'Netflix, Inc.' },
    { symbol: 'BA', name: 'The Boeing Company' },
    { symbol: 'VZ', name: 'Verizon Communications Inc.' },
    { symbol: 'INTC', name: 'Intel Corporation' },
    { symbol: 'PFE', name: 'Pfizer Inc.' },
    { symbol: 'CSCO', name: 'Cisco Systems, Inc.' },
    { symbol: 'KO', name: 'The Coca-Cola Company' },
    { symbol: 'PEP', name: 'PepsiCo, Inc.' },
    { symbol: 'ORCL', name: 'Oracle Corporation' }
    ];

        // Fügt jede Aktie als Option zum Dropdown-Menü hinzu.
    aktien.forEach(aktie => {
        let option = new Option(aktie.name, aktie.symbol);
        aktienAuswahl.appendChild(option);
    });
}

// Funktion zum Speichern des aktuellen Portfolios im Local Storage des Browsers.
function speicherePortfolio() {
        // Konvertiert das 'portfolio'-Objekt in einen String und speichert es im Local Storage.
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
}

// Funktion zum Laden des Portfolios aus dem Local Storage des Browsers.
function ladePortfolio() {
    let gespeichertesPortfolio = localStorage.getItem('portfolio');
    if (gespeichertesPortfolio) {
                // Lädt das Portfolio aus dem Local Storage, falls vorhanden.
        portfolio = JSON.parse(gespeichertesPortfolio);
    } else {
                // Setzt Standardwerte, falls kein Portfolio im Local Storage vorhanden ist.
         portfolio.barvermoegen = 0;
        portfolio.aktien = {};
        aktualisiereUI();
    }
}



// Asynchrone Funktion zum Testen der Verfügbarkeit und Gültigkeit des API-Schlüssels.

async function testApi() {
    const symbol = 'IBM';  // Verwendet IBM als Test-Aktie.
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=RJQ0ZYJYKCSKYZRB`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
                        // Bestätigt, dass der API-Schlüssel gültig ist.
            console.log('API-Schlüssel ist gültig. Antwort:', data);
        } else {
                        // Meldet ein Problem mit der API-Anfrage.
            throw new Error(`Problem bei der API-Anfrage. Status: ${response.status}`);
        }
    } catch (error) {
                // Protokolliert Fehler beim Testen des API-Schlüssels.
        console.error('Fehler beim Testen des API-Schlüssels:', error);
    }
}

