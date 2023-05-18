// PONIŻEJ CZĘŚĆ NIEZBĘDNEJ KONFIGURACJI SERWERA ORAZ KILKA PRZYKŁADOWYCH ŚCIEŻEK API DO POBIERANIA I WYSYŁANIA DANYCH Z I DO BAZY DANYCH



const express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    app = express(),
    mysql = require('mysql2'),
    config = require('./config/config'),
    log4js = require('log4js');

const daneLogowania = require('./data/daneLogowania');
const normaGodzinowa = require('./data/normaGodzinowa');

const email = require('./email/config');

// konfiguracja serwera
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// konfiguracja logów
log4js.configure({
    appenders: { error: {type: 'file', filename: 'error.log'} },
    categories: { default: {appenders: ['error'], level: 'error'} }
});

let logger = log4js.getLogger('error');

// połączenie z bazą danych
let connection = mysql.createConnection({
    host: config.db.HOST,
    port: config.db.PORT,
    user: config.db.USER,
    password: config.db.PASSWORD,
    database: config.db.DB,
});
connection.connect((err) => {
    if (err) {
        logger.error(err);
        console.log('Łączenie z bazą danych nie powiodło się', err);
    } else {
        console.log('Połączono z bazą danych');
    }
});

app.post('/rekord-oficjalne-losowe/', (req, res) => {
    let body = req.body;
    connection.query(`INSERT INTO lista_obecnosci.oficjalne_losowe (id, RFID_odczytany, date, time) VALUES ('${body.id}', '${body.RFID_przypisany}', '${body.date}', '${body.time}')`, (err, oficjalne_losowe, fields) => {
        if (err) {
            logger.error(err);
            res.send(err);
        } else {
            res.send(oficjalne_losowe);
        }
    })
});

app.get('/oficjalne-losowe-wszystkie/', (req, res) => {
    connection.query('SELECT * FROM lista_obecnosci.oficjalne_losowe;', (err, losowe, fields) => {
        if (err) {
            logger.error(err);
            res.send(err);
        } else {
            res.send(losowe)
        }
    })
});

app.get('/glowne/', (req, res) => {
    connection.query('SELECT * FROM lista_obecnosci.pracownik;', (err, pracownicy, fields) => {
        if (err) {
            logger.error(err);
            res.send(err);
        } else {
            connection.query('SELECT * FROM lista_obecnosci.zdarzenia;', (err, zdarzenia, fields) => {
                if (err) {
                    logger.error(err);
                    res.send(err);
                } else {
                    connection.query('SELECT * FROM lista_obecnosci.dzial;', (err, dzialy, fields) => {
                        if (err) {
                            logger.error(err);
                            res.send(err);
                        } else {
                            connection.query('SELECT * FROM lista_obecnosci.nieobecnosci;', (err, nieobecnosci, fields) => {
                                if (err) {
                                    logger.error(err);
                                    res.send(err);
                                } else {
                                    data = [];
                                    for (let i = 0; i < pracownicy.length; i++) {
                                        if (pracownicy[i].lista == 1 || pracownicy[i].lista == 3) {
                                            let dane_pracownika = {
                                                pracownik: pracownicy[i],
                                                daty: [],
                                                dzial: {},
                                                nieobecnosci: [],
                                            }
                                            for (let j = 0; j < zdarzenia.length; j++) {
                                                if (pracownicy[i].RFID_przypisany == zdarzenia[j].RFID_odczytany) {
                                                    dane_pracownika.daty.push(zdarzenia[j]);
                                                }
                                            }
                                            for (let k = 0; k < dzialy.length; k++) {
                                                if (pracownicy[i].ID_dzialu == dzialy[k].id) {
                                                    dane_pracownika.dzial = dzialy[k];
                                                }
                                            }
                                            for (let l = 0; l < nieobecnosci.length; l++) {
                                                if (pracownicy[i].RFID_przypisany == nieobecnosci[l].RFID) {
                                                    dane_pracownika.nieobecnosci.push(nieobecnosci[l]);
                                                }
                                            }
                                            data.push(dane_pracownika);
                                        }
                                    }

                                }
                                res.status(200).send(data);
                            })
                        }
                    })
                }
            })
        }
    })
});

app.post('/nieobecnosci-pracownik/', (req, res) => {
    let body = req.body;
    connection.query(`SELECT * FROM lista_obecnosci.nieobecnosci WHERE RFID = "${body.RFID}"`, (err, nieobecnosci, fields) => {
        if (err) {
            logger.error(err);
            res.send(err);
        } else {
            res.send(nieobecnosci);
        }
    })
});

app.get('/wnioski-urlop-oczekujace/', (req, res) => {
    connection.query(`SELECT * FROM lista_obecnosci.urlop WHERE status="0" OR status="2"`, (err, urlopy, fields) => {
        if (err) {
            logger.error(err);
            res.send(err);
        } else {
            res.send(urlopy);
        }
    })
});

app.get('/wnioski-urlop-zrealizowane/', (req, res) => {
    connection.query(`SELECT * FROM lista_obecnosci.urlop WHERE status="3" OR status="1"`, (err, urlopy, fields) => {
        if (err) {
            logger.error(err);
            res.send(err);
        } else {
            res.send(urlopy);
        }
    })
});

app.post('/wnioski-urlopowe-podwladni/', async (req, res) => {
    let body = req.body;
    this.array = [];
    if (body.length != 0) {
        for (let i = 0; i < body.length; i++) {
            connection.query(`SELECT * FROM lista_obecnosci.urlop WHERE RFID="${body[i].RFID_przypisany}"`, (err, urlopy, fields) => {
                if (err) {
                    logger.error(err);
                    res.send(err);
                } else {
                    for (let j = 0; j < urlopy.length; j++) {
                        if (urlopy[j].status == 0) {
                            this.array.push(urlopy[j]);
                        }
                    }
                }
                if (i == body.length - 1) {
                    res.send(this.array);
                }
            })
        }
    } else {
        res.send(this.array);
    }
});
