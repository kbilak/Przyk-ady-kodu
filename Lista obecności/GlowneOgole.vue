<template>
    <div>
        <v-overlay :value="loading">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
        <div tile>
            <div
                style="padding: 0 100px 0 100px;width:100vw;height:70px;display:flex;flex-direction: row;justify-content:center;align-items:center;font-size:25px;border-bottom: 1px solid gray;">
                <span style="width:50%">Miesiąc: {{this.month}}.{{this.year}} <br>
                    Norma: {{this.norma}}h</span>
                <v-text-field style="width:10%;padding-right:20px" :value="newMonth" v-model="newMonth"
                    :key="this.month" placeholder="Miesiąc">
                </v-text-field>
                <v-text-field style="width:10%;padding-right:20px" :value="newYear" v-model="newYear" :key="this.year"
                    placeholder="Rok">
                </v-text-field>
                <v-btn @click="search(newMonth, newYear)" x-large color="primary" style="width:10%;margin-right:20px">
                    SZUKAJ</v-btn>
                <v-btn @click="print()" style="width:10%;margin-right:20px" x-large color="success">DRUKUJ</v-btn>
                <v-btn @click="reload()" style="width:10%" x-large color="error">ODŚWIEŻ</v-btn>
            </div>
            <div v-for="(item, index) in this.itemsDzialy" :key="index">
                <h1 style="margin-top:20px;">{{dzialy[index].nazwa}}</h1>
                <div v-for="(itemItem, indexItem) in item" :key="indexItem"
                    style="display:flex;justify-content:center;align-items:center;padding:20px">
                    <h2 style="padding-right:20px">{{ itemItem.pracownik.nazwisko }} {{ itemItem.pracownik.imie }}
                        ({{ itemItem.pracownik.norma_godz}})</h2>
                    <h3>-</h3>
                    <h2 style="padding-left:20px;padding-right:20px;">Przepracowano: {{ itemItem.finalHours }}h {{ itemItem.finalMinutes }}min
                    </h2>
                    <h3>-</h3>
                    <h2 style="padding-left:20px">Absencje: {{ itemItem.daysUsed * itemItem.pracownik.norma_godz }}h
                    </h2>
                    <h3 style="padding: 0 20px 0 20px">-</h3>
                    <h2 v-if="itemItem.missingHours >= 0" style="color:red">Norma: {{ itemItem.monthlyHours}}h | Brakuje {{ itemItem.missingHours }}h {{ itemItem.missingMinutes}}min</h2>
                    <h2 v-else style="color:green">Norma: {{ itemItem.monthlyHours}}h | Nadgodziny {{ Math.abs((itemItem.monthlyHours - itemItem.finalHours) - (itemItem.daysUsed * itemItem.pracownik.norma_godz)) }}h {{ itemItem.finalMinutes}}min</h2>
                </div>
            </div>
        </div>
        <v-snackbar v-model="snackbar" :timeout="snackTimeout">
            {{ snackText }}
            <template v-slot:action="{ attrs }">
                <v-btn color="error" text v-bind="attrs" @click="snackbar = false">
                    Zamknij
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script>
    function addHours(date, hours) {
        const newDate = new Date(date);
        newDate.setHours(newDate.getHours() + hours);
        return newDate;
    }

    import dniWolne from '../../../../server/src/data/dniWolne';
    import service from '../../api/config';

    export default {
        data() {
            return {
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                loading: false,
                snackbar: false,
                snackText: '',
                snackTimeout: 2000,
                newMonth: '',
                newYear: '',
                norma: '',
                items: [],
                headers: [
                    {
                        text: 'Pracownik',
                        value: 'pracownik.imieNazwisko',
                        align: 'center',
                        fontsize: '25px'
                    },
                ],
                dzialy: [],
                itemsDzialy: [],
            }
        },
        async created() {
            this.loading = true;
            await this.getItems();
            await this.getNorma();
            await this.getDzialy();
            await this.getItemDataAndAbscences();
            await this.getFinalTime();
            await this.getHeaders();
            await this.getDzialyInfo();
            this.loading = false;
        },
        methods: {
            async getItems() {
                this.items = await service("GET", 'glowne/')
                    .catch((err) => {
                        this.loading = false;
                        throw err;
                    })
                    .then((res) => {
                        return res;
                    })
            },
            async getNorma() {
                this.norma = await service("POST", 'norma/', { month: this.month, year: this.year })
                    .catch((err) => {
                        throw err;
                    })
                    .then((res) => {
                        this.loading = false;
                        return res;
                    })
            },
            async getDzialy() {
                this.dzialy = await service("POST", 'dzialy/')
                    .catch((err) => {
                        this.loading = false;
                        throw err;
                    })
                    .then((res) => {
                        return res;
                    })
            },
            getItemDataAndAbscences() {
                let daysInMonth = 0;
                let currentMonth = new Date(this.year, this.month, 0);
                for (let i = 1; i <= currentMonth.getDate(); i++) {
                    daysInMonth++
                }
                this.items.forEach(item => {
                    item.pracownik.imieNazwisko = item.pracownik.nazwisko + ' ' + item.pracownik.imie;
                    for (let i = 0; i <= item.daty.length - 1; i++) {
                        let dataPlusDwieH = addHours(new Date(item.daty[i].date), 2);
                        let data = dataPlusDwieH.toISOString().substr(0, 10)
                        item.daty[i].date = data;
                    }
                    item.arrayOfDates = [];
                    item.arrayOfHours = [];
                    item.pracownik.normaGodzinowaDzienna = item.pracownik.godz_rozp;
                    item.daysUsed = 0;
                    for (let i = 0; i < item.nieobecnosci.length; i++) {
                        let dataOdPlusDwieH = addHours(new Date(item.nieobecnosci[i].data_od), 2);
                        let dataDoPlusDwieH = addHours(new Date(item.nieobecnosci[i].data_do), 2);
                        let data_od = dataOdPlusDwieH.toISOString().substr(0, 10);
                        let data_do = dataDoPlusDwieH.toISOString().substr(0, 10);
                        item.nieobecnosci[i].data_od = data_od;
                        item.nieobecnosci[i].data_do = data_do;
                    }
                    if (item.nieobecnosci.length > 0) {
                        for (let i = 0; i < item.nieobecnosci.length; i++) {
                            if (item.nieobecnosci[i].data_od.slice(0, 4) == this.year && item.nieobecnosci[i].data_do.slice(0, 4) == this.year && item.nieobecnosci[i].id_absencji != 13) {
                                if (item.nieobecnosci[i].data_od.slice(5, 7) == this.month && item.nieobecnosci[i].data_do.slice(5, 7) == this.month) {
                                    for (let j = parseInt(item.nieobecnosci[i].data_od.slice(8, 10)); j <= parseInt(item.nieobecnosci[i].data_do.slice(8, 10)); j++) {
                                        if (j < 9) {
                                            this.date = new Date(`${this.year}-${this.month}-0${j}T12:00:00`)
                                        } else {
                                            this.date = new Date(`${this.year}-${this.month}-${j}T12:00:00`)
                                        }
                                        for (let k = 0; k < dniWolne.wolne.length; k++) {
                                            if ((dniWolne.wolne[k].year == this.year && dniWolne.wolne[k].month == this.month - 1 && dniWolne.wolne[k].day == j + 1)) {
                                                item.daysUsed = item.daysUsed - 1;
                                            } else {
                                                item.daysUsed = item.daysUsed + 0
                                            }
                                        }
                                        if (this.date.getDay() == 6 || this.date.getDay() == 0) {
                                            item.daysUsed = item.daysUsed - 1
                                        }
                                        item.daysUsed = item.daysUsed + 1
                                    }
                                } else if (item.nieobecnosci[i].data_od.slice(5, 7) < this.month && item.nieobecnosci[i].data_do.slice(5, 7) == this.month) {
                                    for (let j = 1; j <= parseInt(item.nieobecnosci[i].data_do.slice(8, 10)); j++) {
                                        if (j < 9) {
                                            this.date = new Date(`${this.year}-${this.month}-0${j}T12:00:00`)
                                        } else {
                                            this.date = new Date(`${this.year}-${this.month}-${j}T12:00:00`)
                                        }
                                        for (let k = 0; k < dniWolne.wolne.length; k++) {
                                            if ((dniWolne.wolne[k].year == this.year && dniWolne.wolne[k].month == this.month - 1 && dniWolne.wolne[k].day == j + 1)) {
                                                item.daysUsed = item.daysUsed - 1;
                                            } else {
                                                item.daysUsed = item.daysUsed + 0
                                            }
                                        }
                                        if (this.date.getDay() == 6 || this.date.getDay() == 0) {
                                            item.daysUsed = item.daysUsed - 1
                                        }
                                        item.daysUsed = item.daysUsed + 1
                                    }
                                } else if (item.nieobecnosci[i].data_od.slice(5, 7) == this.month && item.nieobecnosci[i].data_do.slice(5, 7) > this.month) {
                                    for (let j = parseInt(item.nieobecnosci[i].data_od.slice(8, 10)); j <= daysInMonth; j++) {
                                        if (j < 9) {
                                            this.date = new Date(`${this.year}-${this.month}-0${j}T12:00:00`)
                                        } else {
                                            this.date = new Date(`${this.year}-${this.month}-${j}T12:00:00`)
                                        }
                                        for (let k = 0; k < dniWolne.wolne.length; k++) {
                                            if ((dniWolne.wolne[k].year == this.year && dniWolne.wolne[k].month == this.month - 1 && dniWolne.wolne[k].day == j + 1)) {
                                                item.daysUsed = item.daysUsed - 1;
                                            } else {
                                                item.daysUsed = item.daysUsed + 0
                                            }
                                        }
                                        if (this.date.getDay() == 6 || this.date.getDay() == 0) {
                                            item.daysUsed = item.daysUsed - 1
                                        }
                                        item.daysUsed = item.daysUsed + 1
                                    }
                                } else if (item.nieobecnosci[i].data_od.slice(5, 7) < this.month && item.nieobecnosci[i].data_do.slice(5, 7) > this.month) {
                                    for (let j = 0; j <= daysInMonth; j++) {
                                        if (j < 9) {
                                            this.date = new Date(`${this.year}-${this.month}-0${j}T12:00:00`)
                                        } else {
                                            this.date = new Date(`${this.year}-${this.month}-${j}T12:00:00`)
                                        }
                                        for (let k = 0; k < dniWolne.wolne.length; k++) {
                                            if ((dniWolne.wolne[k].year == this.year && dniWolne.wolne[k].month == this.month - 1 && dniWolne.wolne[k].day == j + 1)) {
                                                item.daysUsed = item.daysUsed - 1;
                                            } else {
                                                item.daysUsed = item.daysUsed + 0
                                            }
                                        }
                                        if (this.date.getDay() == 6 || this.date.getDay() == 0) {
                                            item.daysUsed = item.daysUsed - 1
                                        }
                                        item.daysUsed = item.daysUsed + 1
                                    }
                                }
                            }
                        }
                    }
                })
            },
            async getFinalTime() {
                let daysInMonth = 0;
                let currentMonth = new Date(this.year, this.month, 0);
                for (let i = 1; i <= currentMonth.getDate(); i++) {
                    daysInMonth++
                }
                await this.items.forEach(async item => {
                    let dayTime = [];
                    for (let i = 1; i <= daysInMonth; i++) {
                        for (let j = 0; j < item.daty.length; j++) {
                            if (new Date(item.daty[j].date).getMonth() + 1 == this.month && new Date(item.daty[j].date).getFullYear() == this.year) {
                                if (i == new Date(item.daty[j].date).getDate()) {
                                    dayTime.push(item.daty[j].time)
                                }
                            }
                        }
                        item.arrayOfDates.push(dayTime)
                        let timeInDayTotal = [];

                        for (let i = 0; i < item.arrayOfDates.length; i++) {
                            item.arrayOfDates[i].sort(function (a, b) {
                                for (let j = 0; j < item.arrayOfDates[i].length; j++) {
                                    return a.localeCompare(b)
                                }
                            })
                        }

                        if (dayTime[0] != undefined && dayTime[dayTime.length - 1] != undefined) {
                            if (dayTime.length == 1) {
                                timeInDayTotal.push('W trakcie');
                            } else {
                                let firstTime = dayTime[0];
                                let lastTime = dayTime[dayTime.length - 1];
                                let dateNewFirst = `${this.year}-${this.month}-${i}T${firstTime}.000Z`;
                                let dateNewLast = `${this.year}-${this.month}-${i}T${lastTime}.000Z`;
                                if (dateNewFirst.slice(9, 10) == 'T') {
                                    let hourFirst = dateNewFirst.slice(10, 12);
                                    let minuteFirst = dateNewFirst.slice(13, 15);
                                    let hourLast = dateNewLast.slice(10, 12);
                                    let minuteLast = dateNewLast.slice(13, 15);
                                    let hourDiff = hourLast - hourFirst
                                    let minuteDiff = minuteLast - minuteFirst;
                                    let minutesInHours = hourDiff * 60;
                                    let minutesTotal = minutesInHours + minuteDiff;
                                    let totalHours = Math.floor(minutesTotal / 60) * 60;
                                    let minutesLeft = minutesTotal - totalHours;
                                    let time = [
                                        [totalHours / 60],
                                        [minutesLeft],
                                    ];
                                    timeInDayTotal.push(time);
                                } else if (dateNewFirst.slice(10, 11) == 'T') {
                                    let hourFirst = dateNewFirst.slice(11, 13);
                                    let minuteFirst = dateNewFirst.slice(14, 16);
                                    let hourLast = dateNewLast.slice(11, 13);
                                    let minuteLast = dateNewLast.slice(14, 16);
                                    let hourDiff = hourLast - hourFirst
                                    let minuteDiff = minuteLast - minuteFirst;
                                    let minutesInHours = hourDiff * 60;
                                    let minutesTotal = minutesInHours + minuteDiff;
                                    let totalHours = Math.floor(minutesTotal / 60) * 60;
                                    let minutesLeft = minutesTotal - totalHours;
                                    let time = [
                                        [totalHours / 60],
                                        [minutesLeft],
                                    ];
                                    timeInDayTotal.push(time);
                                } else {
                                    let hourFirst = dateNewFirst.slice(9, 11);
                                    let minuteFirst = dateNewFirst.slice(12, 14);
                                    let hourLast = dateNewLast.slice(9, 11);
                                    let minuteLast = dateNewLast.slice(12, 14);
                                    let hourDiff = hourLast - hourFirst
                                    let minuteDiff = minuteLast - minuteFirst;
                                    let minutesInHours = hourDiff * 60;
                                    let minutesTotal = minutesInHours + minuteDiff;
                                    let totalHours = Math.floor(minutesTotal / 60) * 60;
                                    let minutesLeft = minutesTotal - totalHours;
                                    let time = [
                                        [totalHours / 60],
                                        [minutesLeft],
                                    ];
                                    timeInDayTotal.push(time);
                                }
                            }
                        }

                        item.arrayOfHours.push(timeInDayTotal);
                        timeInDayTotal = [];
                        dayTime = [];
                    }
                    let hours = 0;
                    let minutes = 0;
                    for (let i = 0; i < item.arrayOfHours.length; i++) {
                        if (item.arrayOfHours[i][0]) {
                            if (item.arrayOfHours[i][0] != 'W trakcie') {
                                hours = hours + item.arrayOfHours[i][0][0][0]
                                minutes = minutes + item.arrayOfHours[i][0][1][0]
                            }
                        }
                    }
                    if (minutes % 60 != 0) {
                        hours = hours + Math.floor(minutes / 60);
                        minutes = minutes % 60;
                    }
                    if (minutes > 60) {
                        minutes = Math.floor(minutes / 60)
                    }
                    item.finalHours = hours;
                    item.finalMinutes = minutes;

                    item.monthlyHours = parseInt((this.norma / 8)) * parseInt(item.pracownik.norma_godz) * item.pracownik.etat / 100;
                    let missingHours = item.monthlyHours - hours - (item.daysUsed * item.pracownik.norma_godz);
                    if (minutes > 0) {
                        let missingMinutes = 60 - minutes;
                        missingHours = missingHours - 1
                        item.missingHours = missingHours;
                        item.missingMinutes = missingMinutes;
                    } else {
                        item.missingHours = missingHours;
                        item.missingMinutes = 0;
                    }
                })
            },
            getHeaders() {
                let daysInMonth = 0;
                let currentMonth = new Date(this.year, this.month, 0);
                for (let i = 1; i <= currentMonth.getDate(); i++) {
                    daysInMonth++
                }
                let weekDays = ['nd', 'po', 'wt', 'śr', 'cz', 'pt', 'so'];
                for (let i = 1; i <= daysInMonth; i++) {
                    let currentWeekDay = new Date(this.year, this.month - 1, i).getDay()
                    this.headers.push({ text: `${i} ${weekDays[currentWeekDay]}`, value: `value${i}`, align: 'center', width: '100px' })
                }
            },
            getDzialyInfo() {
                for (let i = 0; i < this.dzialy.length; i++) {
                    let dzial = [];
                    for (let j = 0; j < this.items.length; j++) {
                        if (this.items[j].dzial.id == this.dzialy[i].id) {
                            dzial.push(this.items[j]);
                        }
                    }
                    this.itemsDzialy.push(dzial)
                }
            },
            async search(month, year) {
                if (month < 1 || month > 12 || year >= `${this.year + 2}`) {
                    this.snackbar = true;
                    this.snackText = 'Błędne wartości';
                } else {
                    this.month = parseInt(month);
                    this.year = parseInt(year);
                    this.items = [];
                    this.norma = '';
                    this.dzialy = [];
                    this.itemsDzialy = [];
                    this.headers = [
                        {
                            text: 'Pracownik',
                            value: 'pracownik.imieNazwisko',
                            align: 'center',
                        },
                    ];
                    this.loading = true;
                    await this.getItems();
                    await this.getNorma();
                    await this.getDzialy();
                    await this.getItemDataAndAbscences();
                    await this.getFinalTime();
                    await this.getHeaders();
                    await this.getDzialyInfo();
                    this.newMonth = '';
                    this.newYear = '';
                }
                this.loading = false;
            },
            async reload() {
                this.loading = true;
                await this.search(this.month, this.year);
                this.snackbar = true;
                this.snackText = 'Odświeżono';
                this.loading = false;
            },
            print() {
                window.print();
            },
        },
    }
</script>