const { initialisiereSpiel, kaufen, verkaufen, ladeAktienPreis, aktualisiereAktienkapital, anzeigenAktienkursPopup, portfolio } = require('script.js');





test('Startkapital wird korrekt initialisiert', () => {
    initialisiereSpiel(5000);
    expect(portfolio.startkapital).toBe(5000);
});


test('Transaktionen werden korrekt protokolliert', async () => {
    await kaufen('AAPL', 10);
    let transaktion = document.getElementById('transaktionen').lastChild.textContent;
    expect(transaktion).toContain('AAPL');
    expect(transaktion).toContain('kaufen');
    expect(transaktion).toContain('10');
});


test('Kauf überschreitet nicht das Barvermögen', async () => {
    initialisiereSpiel(1000);
    await kaufen('AAPL', 100);  
    expect(portfolio.barvermoegen).toBe(1000);  
});


test('Aktien werden zum Portfolio hinzugefügt', async () => {
    await kaufen('AAPL', 5);
    expect(portfolio.aktien['AAPL']).toBe(5);
});


test('Aktien werden korrekt verkauft', async () => {
    await kaufen('AAPL', 5);
    await verkaufen('AAPL', 2);
    expect(portfolio.aktien['AAPL']).toBe(3);
});


test('Börsenkurse werden in Echtzeit geladen', async () => {
    let preis1 = await ladeAktienPreis('AAPL');
    let preis2 = await ladeAktienPreis('AAPL');
    expect(preis1).toEqual(preis2);  
});


test('Anzeige des aktuellen Barvermögens', () => {
    initialisiereSpiel(10000);
    expect(document.getElementById('barvermoegen').textContent).toBe('10000.00');
});


test('Anzeige des Gesamtwerts der Aktien', async () => {
    await kaufen('AAPL', 1);
    await aktualisiereAktienkapital();
    expect(parseFloat(document.getElementById('aktienkapital').textContent)).toBeGreaterThan(0);
});


test('Grafische Darstellung wird erzeugt', async () => {
    await anzeigenAktienkursPopup('AAPL');
    expect(document.getElementById('kursChart').childNodes).not.toBeEmpty();
});



