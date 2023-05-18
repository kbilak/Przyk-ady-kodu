<template>
    <div>
        <v-overlay :value="loading">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
        <div v-if="this.items">
            <v-data-table :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" :itemsPerPage="itemsPerPage" :items="items" :headers="headers" hide-default-footer>
                <template v-slot:[`item.imieNazwisko`]="{ item }">
                    <h2>{{item.imieNazwisko}} ({{item.norma_godz}})</h2>
                </template>
                <template v-slot:[`item.przyslugujacy_urlop`]="{ item }">
                    <span>{{item.przyslugujacy_urlop}}</span>
                    <br>
                    <span style="font-size:12px;">({{item.daysUsed}})</span>
                </template>
                <template v-slot:[`item.dodaj`]="{ item }">
                    <v-btn @click="addRecord(item)" style="margin:20px" x-large color="primary" :key="item.id">DODAJ
                    </v-btn>
                </template>
                <template v-slot:[`item.dodajrecznie`]="{item}">
                    <div style="display:flex;flex-direction:row">
                        <v-text-field style="margin-right:10px" placeholder="hh:mm:ss" label="Godzina"
                            v-model="item.time"></v-text-field>
                        <v-menu v-model="item.menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field v-model="item.date" label="Data" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker v-model="item.date" @input="item.menu = false" locale="pl-pl"></v-date-picker>
                        </v-menu>
                        <v-btn @click="addRecordByHand(item)" style="margin:20px" x-large color="primary"
                            :key="item.id">DODAJ
                            RĘCZNIE</v-btn>
                    </div>
                </template>
                <template v-slot:[`item.dodajnieobecnosc`]="{item}">
                    <div style="display:flex;flex-direction:row">
                        <v-select @change="changeSelect" :items="selectItems" item-text="nazwa" item-value="id" solo placeholder="Typ nieobecności" style="margin-top:33px;max-width:200px;">
                        </v-select>
                        <v-menu v-model="item.menuDataOd" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field v-model="item.data_od" label="Data od" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker v-model="item.data_od" @input="item.menuDataOd = false" locale="pl-pl"></v-date-picker>
                        </v-menu>
                        <v-menu v-model="item.menuDataDo" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field v-model="item.data_do" label="Data do" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker v-model="item.data_do" @input="item.menuDataDo = false" locale="pl-pl"></v-date-picker>
                        </v-menu>
                        <v-btn @click="addAbsence(item)" style="margin:30px" x-large color="error" :key="item.id">DODAJ NIEOBECNOŚĆ</v-btn>
                    </div>
                </template>
            </v-data-table>
            <br>
            <v-btn @click="refresh()" color="success" x-large>ODŚWIEŻ</v-btn>
        </div>
        <div style="margin-bottom:10vh;margin-top:100px; max-width: 100%;display:flex;justify-content: center;align-items: center;flex-direction: column;">
            <h2>Dodaj automatyczne wpisy pracowników dla daty:</h2>
            <div>
                <v-menu v-model="automaticMenu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="automaticDate" label="Data" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
                    </template>
                    <v-date-picker v-model="automaticDate" @input="automaticMenu = false" locale="pl-pl"></v-date-picker>
                </v-menu>
                <v-btn x-large @click="addAutomatic(automaticDate)">DODAJ AUTOMATYCZNE WPISY</v-btn>
            </div>
        </div>
        <div style="margin-bottom:50vh;margin-top:100px; max-width: 100%;display:flex;justify-content: center;align-items: center;flex-direction: column;">
            <h2>Dodaj oficjalne wpisy pracowników dla daty:</h2>
            <div>
                <v-menu v-model="offMenu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="offDate" label="Data" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
                    </template>
                    <v-date-picker v-model="offDate" @input="offMenu = false" locale="pl-pl"></v-date-picker>
                </v-menu>
                <v-btn x-large @click="addOfficial(offDate)">DODAJ OFICJALNE WPISY</v-btn>
            </div>
        </div>
        <v-snackbar v-model="snackbar" :timeout="snackTimeout">
            {{snackText}}
            <template v-slot:action="{ attrs }">
                <v-btn color="error" text v-bind="attrs" @click="snackbar = false">
                    Zamknij
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script>
    function daysInMonth (month, year) {
        return new Date(year, month, 0).getDate();
    }
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }    
    function addHours(date, hours) {
        const newDate = new Date(date);
        newDate.setHours(newDate.getHours() + hours);
        return newDate;
    }
    import service from '../../api/config';
    import dniWolne from '../../../../server/src/data/dniWolne';
    export default {
        name: 'kadry-panel',
        data () {
            return {
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                itemsPerPage: 500,
                loading: false,
                snackbar: false,
                snackText: '',
                snackTimeout: 2000,
                items: [],
                sortBy: 'imieNazwisko',
                sortDesc: false,
                headers: [
                    {
                        text: 'Pracownik', 
                        value: 'imieNazwisko',
                        align: 'center',
                        width: '180px'
                    },
                    {
                        text: 'RFID',
                        value: 'RFID_przypisany',
                        align: 'center',
                        width: '180px',
                    },
                    {
                        text: 'ID działu',
                        value: 'ID_dzialu',
                        align: 'center',
                        width: '70px'
                    },
                    {
                        text: 'Etat %',
                        value: 'etat',
                        align: 'center',
                        width: '70px'
                    },
                    {
                        text: 'Przys. urlop',
                        value: 'przyslugujacy_urlop',
                        align: 'center',
                        width: '70px'
                    },
                    {
                        text: 'Godz. rozp.',
                        value: 'godz_rozp',
                        align: 'center',
                        width: '100px'
                    },
                    {
                        text: 'Godz. zak.',
                        value: 'godz_zak',
                        align: 'center',
                        width: '100px'
                    },
                    {
                        text: 'Dodaj rekord',
                        value: 'dodaj',
                        align: 'center',
                        width: '100px'
                    },
                    {
                        text: 'Dodaj rekord ręcznie',
                        value: 'dodajrecznie',
                        align: 'center',
                        width: '500px'
                    },
                    {
                        text: 'Dodaj nieobecność',
                        value: 'dodajnieobecnosc',
                        align: 'center',
                        width: '900px'
                    }
                ],
                selectItems: [
                    {}
                ],
                selectedItem: null,
                automaticDate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
                automaticMenu: false,
                offDate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
                offMenu: false,
            }
        },
        async created () {
            this.loading = true;

            this.items.forEach(item => {
                item.menu = false;
                item.dateCalendar = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10);
                item.menuDataOd = false;
                item.menuDataDo = false;
            })

            this.items = await service("GET", 'kadry/')
                .catch((err) => {
                    this.loading = false;
                    throw err;
                })
                .then((res) => {
                    return res;
                })
            this.zdarzenia = await service("GET", 'zdarzenia/')
                .catch((err) => {
                    this.loading = false;
                    throw err;
                })
                .then((res) => {
                    return res;
                })
            this.items.forEach(async item => {
                item.imieNazwisko = item.nazwisko + ' ' + item.imie;
                let nieobecnosci = await service("POST", 'nieobecnosci-pracownik/', {RFID: item.RFID_przypisany})
                    .catch((err) => {
                        this.loading = false;
                        throw err;
                    })
                    .then((res) => {
                        return res;
                    })

                function addHours(date, hours) {
                    const newDate = new Date(date);
                    newDate.setHours(newDate.getHours() + hours);
                    return newDate;
                }
                for (let i = 0; i < nieobecnosci.length; i++) {
                    let dataOdPlusDwieH = addHours(new Date(nieobecnosci[i].data_od), 2);
                    let dataDoPlusDwieH = addHours(new Date(nieobecnosci[i].data_do), 2);
                    let data_od = dataOdPlusDwieH.toISOString().substr(0,10);
                    let data_do = dataDoPlusDwieH.toISOString().substr(0,10);
                    nieobecnosci[i].data_od = data_od;
                    nieobecnosci[i].data_do = data_do;
                }

                let arrayOfDays = [];

                for (let i = 0; i < nieobecnosci.length; i++) {
                    if (nieobecnosci[i].data_od.slice(0,4) == this.year) {
                        let count = 0;
                        if (nieobecnosci[i].data_od.slice(5,7) == nieobecnosci[i].data_do.slice(5,7)) {
                            if (parseInt(nieobecnosci[i].data_od.slice(8,10)) == parseInt(nieobecnosci[i].data_do.slice(8,10))) {
                                count = count + 1;
                            } else {
                                for (let j = parseInt(nieobecnosci[i].data_od.slice(8,10)); j < parseInt(nieobecnosci[i].data_do.slice(8,10)) + 1; j++) {
                                    for (let k = 0; k < dniWolne.wolne.length; k++) {
                                        if (dniWolne.wolne[k].year == this.year && dniWolne.wolne[k].month == parseInt(nieobecnosci[i].data_od.slice(5,7)) - 1 && dniWolne.wolne[k].day == j) {
                                            count = count - 1;
                                        } 
                                    }
                                    if (new Date(`${this.year}-${nieobecnosci[i].data_od.slice(5,7)}-${j}`).getDay() == 6 || new Date(`${this.year}-${nieobecnosci[i].data_od.slice(5,7)}-${j}`).getDay() == 0) {
                                        count = count + 0;
                                    } else {
                                        count = count + 1;
                                    }
                                }
                            }
                        } else {
                            for (let j = parseInt(nieobecnosci[i].data_od.slice(5,7)); j < parseInt(nieobecnosci[i].data_do.slice(5,7)) + 1; j++) {
                                let days = daysInMonth(j, this.year);
                                if (j == parseInt(nieobecnosci[i].data_od.slice(5,7))) {
                                    for (let k = parseInt(nieobecnosci[i].data_od.slice(8,10)); k < days + 1; k++) {
                                        for (let l = 0; l < dniWolne.wolne.length; l++) {
                                            if (dniWolne.wolne[l].year == this.year && dniWolne.wolne[l].month == parseInt(nieobecnosci[i].data_od.slice(5,7)) - 1 && dniWolne.wolne[l].day == k) {
                                                count = count - 1;
                                            } 
                                        }
                                        if (new Date(`${this.year}-${nieobecnosci[i].data_od.slice(5,7)}-${k}`).getDay() == 6 || new Date(`${this.year}-${nieobecnosci[i].data_od.slice(5,7)}-${k}`).getDay() == 0) {
                                            count = count + 0;
                                        } else {
                                            count = count + 1;
                                        }
                                    }
                                } else if (j == parseInt(nieobecnosci[i].data_do.slice(5,7))) {
                                    for (let k = 1; k < parseInt(nieobecnosci[i].data_do.slice(8,10)) + 1; k++) {
                                        for (let l = 0; l < dniWolne.wolne.length; l++) {
                                            if (dniWolne.wolne[l].year == this.year && dniWolne.wolne[l].month == parseInt(nieobecnosci[i].data_do.slice(5,7)) - 1 && dniWolne.wolne[l].day == k) {
                                                count = count - 1;
                                            } 
                                        }
                                        if (new Date(`${this.year}-${nieobecnosci[i].data_do.slice(5,7)}-${k}`).getDay() == 6 || new Date(`${this.year}-${nieobecnosci[i].data_do.slice(5,7)}-${k}`).getDay() == 0) {
                                            count = count + 0;
                                        } else {
                                            count = count + 1;
                                        }
                                    }
                                } else {
                                    for (let k = 1; k < days + 1; k++) {
                                        for (let l = 0; l < dniWolne.wolne.length; l++) {
                                            if (dniWolne.wolne[l].year == this.year && dniWolne.wolne[l].month == j - 1 && dniWolne.wolne[l].day == k) {
                                                count = count - 1;
                                            }    
                                        }
                                        if (new Date(`${this.year}-${nieobecnosci[i].data_od.slice(5,7)}-${k}`).getDay() == 6 || new Date(`${this.year}-${nieobecnosci[i].data_od.slice(5,7)}-${k}`).getDay() == 0) {
                                            count = count + 0;
                                        } else {
                                            count = count + 1;
                                        }
                                    }
                                }
                            }
                        }
                        arrayOfDays.push(count);
                    }
                }
                let daysUsed = 0;
                for (let i = 0; i < arrayOfDays.length; i++) {
                    daysUsed = daysUsed + arrayOfDays[i];
                }
                item.daysUsed = daysUsed;
            });
            this.selectItems = await service("GET", 'rodzaje-absencji/')
                .catch((err) => {
                    this.loading = false;
                    throw err;
                })
                .then((res) => {
                    return res;
                })
            this.refresh();
        },
        methods: {
            async refresh() {
                this.items = [];
                this.loading = true;
                this.items = await service("GET", 'kadry/')
                    .catch((err) => {
                        this.loading = false;
                        throw err;
                    })
                    .then((res) => {
                        return res;
                    })
                this.items.forEach(async item => {
                    item.imieNazwisko = item.nazwisko + ' ' + item.imie;
                    let nieobecnosci = await service("POST", 'nieobecnosci-pracownik/', {RFID: item.RFID_przypisany})
                        .catch((err) => {
                            this.loading = false;
                            throw err;
                        })
                        .then((res) => {
                            return res;
                        })

                    function addHours(date, hours) {
                        const newDate = new Date(date);
                        newDate.setHours(newDate.getHours() + hours);
                        return newDate;
                    }
                    for (let i = 0; i < nieobecnosci.length; i++) {
                        let dataOdPlusDwieH = addHours(new Date(nieobecnosci[i].data_od), 2);
                        let dataDoPlusDwieH = addHours(new Date(nieobecnosci[i].data_do), 2);
                        let data_od = dataOdPlusDwieH.toISOString().substr(0,10);
                        let data_do = dataDoPlusDwieH.toISOString().substr(0,10);
                        nieobecnosci[i].data_od = data_od;
                        nieobecnosci[i].data_do = data_do;
                    }

                    let arrayOfDays = [];
                    for (let i = 0; i < nieobecnosci.length; i++) {
                        if (nieobecnosci[i].data_od.slice(0,4) == this.year) {
                            let count = 0;
                            if (nieobecnosci[i].data_od.slice(5,7) == nieobecnosci[i].data_do.slice(5,7)) {
                                if (parseInt(nieobecnosci[i].data_od.slice(8,10)) == parseInt(nieobecnosci[i].data_do.slice(8,10))) {
                                    count = count + 1;
                                } else {
                                    for (let j = parseInt(nieobecnosci[i].data_od.slice(8,10)); j < parseInt(nieobecnosci[i].data_do.slice(8,10)) + 1; j++) {
                                        for (let k = 0; k < dniWolne.wolne.length; k++) {
                                            if (dniWolne.wolne[k].year == this.year && dniWolne.wolne[k].month == parseInt(nieobecnosci[i].data_od.slice(5,7)) - 1 && dniWolne.wolne[k].day == j) {
                                                count = count - 1;
                                            } 
                                        }
                                        if (new Date(`${this.year}-${nieobecnosci[i].data_od.slice(5,7)}-${j}`).getDay() == 6 || new Date(`${this.year}-${nieobecnosci[i].data_od.slice(5,7)}-${j}`).getDay() == 0) {
                                            count = count + 0;
                                        } else {
                                            count = count + 1;
                                        }
                                    }
                                }
                            } else {
                                for (let j = parseInt(nieobecnosci[i].data_od.slice(5,7)); j < parseInt(nieobecnosci[i].data_do.slice(5,7)) + 1; j++) {
                                    let days = daysInMonth(j, this.year);
                                    if (j == parseInt(nieobecnosci[i].data_od.slice(5,7))) {
                                        for (let k = parseInt(nieobecnosci[i].data_od.slice(8,10)); k < days + 1; k++) {
                                            for (let l = 0; l < dniWolne.wolne.length; l++) {
                                                if (dniWolne.wolne[l].year == this.year && dniWolne.wolne[l].month == parseInt(nieobecnosci[i].data_od.slice(5,7)) - 1 && dniWolne.wolne[l].day == k) {
                                                    count = count - 1;
                                                } 
                                            }
                                            if (new Date(`${this.year}-${nieobecnosci[i].data_od.slice(5,7)}-${k}`).getDay() == 6 || new Date(`${this.year}-${nieobecnosci[i].data_od.slice(5,7)}-${k}`).getDay() == 0) {
                                                count = count + 0;
                                            } else {
                                                count = count + 1;
                                            }
                                        }
                                    } else if (j == parseInt(nieobecnosci[i].data_do.slice(5,7))) {
                                        for (let k = 1; k < parseInt(nieobecnosci[i].data_do.slice(8,10)) + 1; k++) {
                                            for (let l = 0; l < dniWolne.wolne.length; l++) {
                                                if (dniWolne.wolne[l].year == this.year && dniWolne.wolne[l].month == parseInt(nieobecnosci[i].data_do.slice(5,7)) - 1 && dniWolne.wolne[l].day == k) {
                                                    count = count - 1;
                                                } 
                                            }
                                            if (new Date(`${this.year}-${nieobecnosci[i].data_do.slice(5,7)}-${k}`).getDay() == 6 || new Date(`${this.year}-${nieobecnosci[i].data_do.slice(5,7)}-${k}`).getDay() == 0) {
                                                count = count + 0;
                                            } else {
                                                count = count + 1;
                                            }
                                        }
                                    } else {
                                        for (let k = 1; k < days + 1; k++) {
                                            for (let l = 0; l < dniWolne.wolne.length; l++) {
                                                if (dniWolne.wolne[l].year == this.year && dniWolne.wolne[l].month == j - 1 && dniWolne.wolne[l].day == k) {
                                                    count = count - 1;
                                                }    
                                            }
                                            if (new Date(`${this.year}-${nieobecnosci[i].data_od.slice(5,7)}-${k}`).getDay() == 6 || new Date(`${this.year}-${nieobecnosci[i].data_od.slice(5,7)}-${k}`).getDay() == 0) {
                                                count = count + 0;
                                            } else {
                                                count = count + 1;
                                            }
                                        }
                                    }
                                }
                            }
                            arrayOfDays.push(count);
                        }
                    }
                    let daysUsed = 0;
                    for (let i = 0; i < arrayOfDays.length; i++) {
                        daysUsed = daysUsed + arrayOfDays[i];
                    }
                    item.daysUsed = daysUsed;
                })
                this.selectItems = await service("GET", 'rodzaje-absencji/')
                    .catch((err) => {
                        this.loading = false;
                        throw err;
                    })
                    .then((res) => {
                        return res;
                    })
                this.loading = false;
            },
            async addRecord(item) {
                this.loading = true;
                function addHours(date, hours) {
                    const newDate = new Date(date);
                    newDate.setHours(newDate.getHours() + hours);
                    return newDate;
                }
                let date = addHours(new Date(), 2);
                let dateString = date.toISOString();
                let dateDate = dateString.slice(0, 10);
                let dateTime = dateString.slice(11, 19);
                await service("POST", "rekord-admin/", { RFID_przypisany: item.RFID_przypisany, date: dateDate, time: dateTime })
                    .catch((err) => {
                        this.loading = false;
                        throw err;
                    })
                    .then((res) => {
                        this.loading = false;
                        this.snackText = 'Poprawnie dodano rekord do bazy danych';
                        this.snackbar = true;
                        return res;
                    })
            },
            async addRecordByHand(item) {
                this.loading = true;
                await service("POST", "rekord-admin/", { RFID_przypisany: item.RFID_przypisany, date: item.date, time: item.time })
                    .catch((err) => {
                        this.loading = false;
                        throw err;
                    })
                    .then((res) => {
                        this.loading = false;
                        this.snackText = 'Poprawnie dodano rekord do bazy danych';
                        this.snackbar = true;
                        return res;
                    })
            },
            changeSelect: async function(value) {
                this.selectedItem = value;
            },
            async addAbsence(item) {
                this.loading = true;
                await service("POST", "dodaj-nieobecnosc/", {RFID: item.RFID_przypisany, id_absencji: this.selectedItem, data_od: item.data_od, data_do: item.data_do})
                    .catch((err) => {
                        this.loading = false;
                        throw err;
                    })
                    .then((res) => {
                        this.loading = false;
                        this.snackText = 'Poprawnie dodano nieobecność';
                        this.snackbar = true;
                        return res;
                    })
            },
            async addAutomatic(dataWpisana) {
                this.loading = true;
                this.items = await service("GET", 'glowne/')
                    .catch((err) => {
                        this.loading = false;
                        throw err;
                    })
                    .then((res) => {
                        return res;
                    })
                this.zdarzenia = await service("GET", 'zdarzenia/')
                    .catch((err) => {
                        this.loading = false;
                        throw err;
                    })
                    .then((res) => {
                        return res;
                    })
                this.counter = 0;
                this.value = this.zdarzenia[this.zdarzenia.length - 1].id;
                
                for (let i = 0; i < this.items.length; i++) {
                    this.items[i].pracownik.imieNazwisko = this.items[i].pracownik.nazwisko + ' ' + this.items[i].pracownik.imie;
                    for (let j = 0; j < this.items[i].daty.length; j++) {
                        let dataPlusDwieH = addHours(new Date(this.items[i].daty[j].date), 2);
                        let data = dataPlusDwieH.toISOString().substr(0,10);
                        this.items[i].daty[j].date = data;
                    }

                    for (let j = 0; j < this.items[i].nieobecnosci.length; j++) {
                        let dataOdPlusDwieH = addHours(new Date(this.items[i].nieobecnosci[j].data_od), 2);
                        let dataDoPlusDwieH = addHours(new Date(this.items[i].nieobecnosci[j].data_do), 2);
                        let data_od = dataOdPlusDwieH.toISOString().substr(0,10);
                        let data_do = dataDoPlusDwieH.toISOString().substr(0,10);
                        this.items[i].nieobecnosci[j].data_od = data_od;
                        this.items[i].nieobecnosci[j].data_do = data_do;
                    }

                    this.items[i].arrayOfDates = [];
                    this.items[i].arrayOfHours = [];
                    this.items[i].pracownik.normaGodzinowaDzienna = this.items[i].pracownik.godz_rozp;
                    this.counter = this.counter + 2;
                    let arrayOfNormal = [];
                    
                    for (let j = 0; j < this.items[i].daty.length; j++) {
                        if (new Date(this.items[i].daty[j].date).getMonth() + 1 == this.month && new Date(this.items[i].daty[j].date).getFullYear() == this.year) {
                            arrayOfNormal.push(this.items[i].daty[j]);
                        }
                    }

                    if (this.items[i].pracownik.automat == 1) {
                        let dataTeraz = new Date(dataWpisana);
                        let dayOfTheMonth = dataTeraz.getDate();
                        this.count = 0;

                        for (let j = 0; j < dniWolne.wolne.length; j++) {
                            if (dniWolne.wolne[j].year == this.year && dniWolne.wolne[j].month == this.month && dniWolne.wolne[j].day == dayOfTheMonth) {
                                break;
                            } else {
                                this.date = dataTeraz.toISOString().substr(0,10);
                                for (let k = 0; k < arrayOfNormal.length; k++) {
                                    if (arrayOfNormal[k].date == this.date) {
                                        this.count = this.count + 1
                                        break;
                                    } 
                                }
                            }
                        }
                        if (this.count == 0) {
                            let arrayStartMinutes = ['45','46','47','48','49','50','51','52','53','54','55','56','57','58','59'];
                            let arrayEndMinutes = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14'];
                            let arrayStartSeconds = ['01','02','03','04','05','06','07','08','09','10',
                                                    '11','12','13','14','15','16','17','18','19','20',
                                                    '31','32','33','34','35','36','37','38','39','40',
                                                    '41','42','43','44','45','46','47','48','49','50',
                                                    '51','52','53','54','55','56','57','58','59'];
                            let minutyFound = arrayStartMinutes[getRandomInt(14)];
                            let sekundyFound = arrayStartSeconds[getRandomInt(58)];
                            if (sekundyFound === undefined) {
                                sekundyFound = '37';
                            }

                            let minutyFoundEnd = arrayEndMinutes[getRandomInt(14)];
                            let sekundyFoundEnd = arrayStartSeconds[getRandomInt(58)];
                            if (sekundyFoundEnd === undefined) {
                                sekundyFoundEnd = '58';
                            }

                            let item = this.items[i];

                            let mainFunct = async function() {
                                if ((item.pracownik.godz_rozp).slice(0,2) < 11) {
                                    let godzina = parseInt((item.pracownik.godz_rozp).slice(0,2)) - 1;
                                    let time = '0' + godzina + ':' + minutyFound + ':' + sekundyFound;
                                    let data = {RFID_przypisany: item.pracownik.RFID_przypisany, date: dataWpisana, time:time};
                                    await service("POST", "rekord/", data)
                                        .catch((err) => {
                                            throw err;
                                        })
                                        .then(async (res) => {
                                            return res;
                                        })
                                } else {
                                    let godzina = parseInt((item.pracownik.godz_rozp.slice(0,2)));
                                    let time = godzina + ':' + minutyFound + ':' + sekundyFound;
                                    let data = {RFID_przypisany: item.pracownik.RFID_przypisany, date: dataWpisana, time:time};
                                    await service("POST", "rekord/", data)
                                        .catch((err) => {
                                            throw err;
                                        })
                                        .then(async (res) => {
                                            return res;
                                        })
                                }
                                if ((item.pracownik.godz_zak).slice(0,2) < 11) {
                                    let godzina = parseInt((item.pracownik.godz_zak).slice(0,2)) - 1;
                                    let time = '0' + godzina + ':' + minutyFoundEnd + ':' + sekundyFoundEnd;
                                    let data = {RFID_przypisany: item.pracownik.RFID_przypisany, date: dataWpisana, time:time};
                                    await service("POST", "rekord/", data)
                                        .catch((err) => {
                                            throw err;
                                        })
                                        .then(async (res) => {
                                            return res;
                                        })
                                } else {
                                    let godzina = parseInt((item.pracownik.godz_zak.slice(0,2)));
                                    let time = godzina + ':' + minutyFoundEnd + ':' + sekundyFoundEnd;
                                    let data = {RFID_przypisany: item.pracownik.RFID_przypisany, date: dataWpisana, time:time};
                                    await service("POST", "rekord/", data)
                                        .catch((err) => {
                                            throw err;
                                        })
                                        .then((res) => {
                                            return res;
                                        })
                                }
                            }
                            mainFunct();
                        }
                    }
                }

                this.counter = 0;    
                this.loading = false;
                this.refresh();
            },
            async addOfficial(dataWpisana) {
                this.loading = true;
                this.items = await service("GET", 'oficjalne-losowe/')
                    .catch((err) => {
                        this.loading = false;
                        throw err;
                    })
                    .then((res) => {
                        return res;
                    })
                this.oficjalne_losowe = await service("GET", 'oficjalne-losowe-wszystkie/')
                    .catch((err) => {
                        this.loading = false;
                        throw err;
                    })
                    .then((res) => {
                        return res;
                    })

                this.items.forEach(async item => {
                    item.pracownik.imieNazwisko = item.pracownik.nazwisko + ' ' + item.pracownik.imie;
                    function addHours(date, hours) {
                        const newDate = new Date(date);
                        newDate.setHours(newDate.getHours() + hours);
                        return newDate;
                    }
                    for (let i = 0; i <= item.daty.length - 1; i++) {
                        let dataPlusDwieH = addHours(new Date(item.daty[i].date), 2);
                        let data = dataPlusDwieH.toISOString().substr(0, 10);
                        item.daty[i].date = data;
                    }
                    item.arrayOfDates = [];
                    item.arrayOfHours = [];
                    item.pracownik.normaGodzinowaDzienna = item.pracownik.godz_rozp;
                });

                this.counter = 0;
                if (this.oficjalne_losowe.length == 0) {
                    this.value = 0;
                } else {
                    this.value = this.oficjalne_losowe[this.oficjalne_losowe.length - 1].id
                }

                for (let i = 0; i < this.items.length; i++) {
                    this.countZdarzenia = 0;
                    for (let k = 0; k < this.items[i].zdarzenia.length; k++) {
                        let dataPlusDwieH = addHours(new Date(this.items[i].zdarzenia[k].date), 2);
                        let data = dataPlusDwieH.toISOString().substr(0,10);
                        this.items[i].zdarzenia[k].date = data;
                        if (data == dataWpisana) {
                            this.countZdarzenia = this.countZdarzenia + 1;
                        }
                    }
                    if (this.countZdarzenia > 0) {

                        this.items[i].pracownik.imieNazwisko = this.items[i].pracownik.nazwisko + ' ' + this.items[i].pracownik.imie;
                        for (let j = 0; j < this.items[i].daty.length; j++) {
                            let dataPlusDwieH = addHours(new Date(this.items[i].daty[j].date), 2);
                            let data = dataPlusDwieH.toISOString().substr(0,10);
                            this.items[i].daty[j].date = data;
                        }

                        for (let j = 0; j < this.items[i].nieobecnosci.length; j++) {
                            let dataOdPlusDwieH = addHours(new Date(this.items[i].nieobecnosci[j].data_od), 2);
                            let dataDoPlusDwieH = addHours(new Date(this.items[i].nieobecnosci[j].data_do), 2);
                            let data_od = dataOdPlusDwieH.toISOString().substr(0,10);
                            let data_do = dataDoPlusDwieH.toISOString().substr(0,10);
                            this.items[i].nieobecnosci[j].data_od = data_od;
                            this.items[i].nieobecnosci[j].data_do = data_do;
                        }

                        this.items[i].arrayOfDates = [];
                        this.items[i].arrayOfHours = [];
                        this.items[i].pracownik.normaGodzinowaDzienna = this.items[i].pracownik.godz_rozp;
                        this.counter = this.counter + 2;
                        let arrayOfNormal = [];
                        
                        for (let j = 0; j < this.items[i].daty.length; j++) {
                            if (new Date(this.items[i].daty[j].date).getMonth() + 1 == this.month && new Date(this.items[i].daty[j].date).getFullYear() == this.year) {
                                arrayOfNormal.push(this.items[i].daty[j]);
                            }
                        }

                        let dataTeraz = new Date(dataWpisana);
                        let dayOfTheMonth = dataTeraz.getDate();
                        this.count = 0;

                        for (let j = 0; j < dniWolne.wolne.length; j++) {
                            if (dniWolne.wolne[j].year == this.year && dniWolne.wolne[j].month == this.month && dniWolne.wolne[j].day == dayOfTheMonth) {
                                break;
                            } else {
                                this.date = dataTeraz.toISOString().substr(0,10);
                                for (let k = 0; k < arrayOfNormal.length; k++) {
                                    if (arrayOfNormal[k].date == this.date) {
                                        this.count = this.count + 1
                                        break;
                                    } 
                                }
                            }
                        }
                    
                        if (this.count == 0) {
                            let arrayStartMinutes = ['45','46','47','48','49','50','51','52','53','54','55','56','57','58','59'];
                            // let arrayEndMinutes = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14'];
                            let arrayStartSeconds = ['01','02','03','04','05','06','07','08','09','10',
                                                    '11','12','13','14','15','16','17','18','19','20',
                                                    '31','32','33','34','35','36','37','38','39','40',
                                                    '41','42','43','44','45','46','47','48','49','50',
                                                    '51','52','53','54','55','56','57','58','59'];
                            let minutyFound = arrayStartMinutes[getRandomInt(14)];
                            let sekundyFound = arrayStartSeconds[getRandomInt(58)];
                            if (sekundyFound === undefined) {
                                sekundyFound = '37';
                            }

                            // let minutyFoundEnd = arrayEndMinutes[getRandomInt(14)];
                            let sekundyFoundEnd = arrayStartSeconds[getRandomInt(58)];
                            if (sekundyFoundEnd === undefined) {
                                sekundyFoundEnd = '58';
                            }

                            let item = this.items[i];
                            let counter = this.counter;
                            let value = this.value;

                            let mainFunct = async function() {
                                if ((item.pracownik.godz_rozp).slice(0,2) < 11) {
                                    let godzina = parseInt((item.pracownik.godz_rozp).slice(0,2)) - 1;
                                    let time = '0' + godzina + ':' + minutyFound + ':' + sekundyFound;
                                    let data = {id: `${value + counter}`, RFID_przypisany: item.pracownik.RFID_przypisany, date: dataWpisana, time:time};
                                    await service("POST", "rekord-oficjalne-losowe/", data)
                                        .catch((err) => {
                                            throw err;
                                        })
                                        .then(async (res) => {
                                            return res;
                                        })
                                } else {
                                    let godzina = parseInt((item.pracownik.godz_rozp.slice(0,2)));
                                    let time = godzina + ':' + minutyFound + ':' + sekundyFound;
                                    let data = {id: `${value + counter}`, RFID_przypisany: item.pracownik.RFID_przypisany, date: dataWpisana, time:time};
                                    await service("POST", "rekord-oficjalne-losowe/", data)
                                        .catch((err) => {
                                            throw err;
                                        })
                                        .then(async (res) => {
                                            return res;
                                        })
                                }
                                if ((item.pracownik.godz_zak).slice(0,2) < 11) {
                                    let godzina = parseInt((item.pracownik.godz_zak).slice(0,2)) - 2;
                                    let time = '0' + godzina + ':' + minutyFound + ':' + sekundyFoundEnd;
                                    let data = {id: `${value + counter + 1}`, RFID_przypisany: item.pracownik.RFID_przypisany, date: dataWpisana, time:time};
                                    await service("POST", "rekord-oficjalne-losowe/", data)
                                        .catch((err) => {
                                            throw err;
                                        })
                                        .then(async (res) => {
                                            return res;
                                        })
                                } else {
                                    let godzina = parseInt((item.pracownik.godz_zak.slice(0,2))) - 1;
                                    let time = godzina + ':' + minutyFound + ':' + sekundyFoundEnd;
                                    let data = {id: `${value + counter + 1}`, RFID_przypisany: item.pracownik.RFID_przypisany, date: dataWpisana, time:time};
                                    await service("POST", "rekord-oficjalne-losowe/", data)
                                        .catch((err) => {
                                            throw err;
                                        })
                                        .then((res) => {
                                            return res;
                                        })
                                }
                            }
                            mainFunct();
                        }
                    }
                }
                this.countZdarzenia = 0;
                this.counter = 0;    
                this.loading = false;
                this.refresh();
            }
        }
    }
</script>