<template>
    <section class="w-[750px] h-[1000px] flex flex-col">
        <div class="w-[100%] h-[10%] flex border-b-2">
            <div class="w-[33%] h-[100%] flex flex-col items-center justify-center">
                <span class="text-2xl font-bold">Bar Chiński Panda</span>
                <span class="text-xl">Panel zamówień</span>
            </div>
            <div class="w-[33%] h-[100%] flex text-3xl text-center items-center justify-center">
                <span v-if="choice === 1" class="bg-red-400 text-white py-3 px-5 cursor-pointer" @click="orders_w_toku()">W TOKU ({{ nieodebrane }})</span>
                <span v-else class="bg-red-700 text-white py-3 px-5 cursor-pointer" @click="orders_w_toku()">W TOKU ({{ nieodebrane }})</span>
            </div>
            <div class="w-[33%] h-[100%] flex text-3xl items-center justify-center">
                <span v-if="choice === 0" class="bg-green-400 text-white py-3 px-5 cursor-pointer" @click="orders_odebrane()">ODEBRANE</span>
                <span v-else class="bg-green-800 text-white py-3 px-5 cursor-pointer" @click="orders_odebrane()">ODEBRANE</span>
            </div>
        </div>
        <div class="w-[100%] h-[84%] flex">
            <div class="w-[30%] h-[100%] overflow-y-scroll border-r-2">
                <div v-for="(o, i) in orders" @click="change(o.id)" :key="i" class="border-b-2 flex items-center justify-center cursor-pointer">
                    <span v-if="!o.panel_odebrane && o.id !== id" class="text-lg py-5 px-2">{{ o.data_zamówienia }} <b>({{ o.przedmioty.length }})</b></span>
                    <span v-else-if="!o.panel_odebrane && o.id == id" class="text-lg bg-grey py-5 px-2">{{ o.data_zamówienia }} <b>({{ o.przedmioty.length }})</b> </span>
                    <span v-else-if="o.panel_odebrane && o.id !== id" class="text-grey py-5 px-2">{{ o.data_zamówienia }} <b>({{ o.przedmioty.length }})</b> </span>
                    <span v-else class="text-white py-5 px-2 bg-grey">{{ o.data_zamówienia }} <b>({{ o.przedmioty.length }})</b> </span>
                </div>
            </div>
            <div class="w-[70%] h-[100%] flex flex-col p-5 overflow-y-scroll">
                <span class="text-2xl text-center">Zamówienie nr <b>{{ id }}</b></span>
                <span class="text-center mb-5">Nr płatności <b>{{ id_płatności }}</b></span>
                <span v-if="dostawa" class="py-3 px-2 text-white bg-red text-center text-4xl">DOSTAWA</span>
                <span v-else class="py-3 px-2 text-white bg-green text-center text-4xl">ODBIÓR OSOBISTY</span>
                <div v-if="dostawa" class="text-3xl mt-2">
                    <span>{{ dostawa_ulica }} <br> {{ dostawa_kod_pocztowy }} {{ dostawa_miejscowość }}</span>
                </div>
                <div class="mt-5">
                    <span class="text-4xl font-bold">Dane kupującego</span>
                    <div class="text-xl mt-5 flex flex-col">
                        <span class="pb-1">{{ kupujący_imię }} {{ kupujący_nazwisko }}</span>
                        <span class="py-1">{{ kupujący_telefon }}</span>
                        <span v-if="wiadomość.length > 0" class="py-1">Wiadomość: <b>{{ wiadomość }}</b></span>
                    </div>
                </div>
                <div class="mt-5 flex flex-col">
                    <span class="text-4xl font-bold mb-2">Zamówienie</span>
                    <div v-for="(p, i) in przedmioty" :key="i" class="border-b-2 text-xl py-2">
                        <span><b>{{ p.ilość }}</b> x {{ p.nazwa }} - </span>
                        <span class="font-bold"> {{ parseInt(p.cena_jednostkowa) * parseInt(p.ilość) }}zł</span>
                    </div>
                </div>
                <div class="mt-5">
                    <span class="text-3xl font-bold">Łączna wartość: <b>{{ łączna_wartość }}</b>zł</span>
                    <div class="text-xl mt-5 flex flex-col">
                        <span class="pb-1"></span>
                    </div>
                </div>
                <span v-if="!odebrane" class="text-white bg-red py-3 font-bold text-2xl text-center cursor-pointer mt-5" @click="complete(id)">OZNACZ ZAMÓWIENIE JAKO ODEBRANE</span>
                <span v-else class="text-white bg-green py-3 font-bold text-2xl text-center mt-5">ZAMÓWIENIE ODEBRANE</span>
            </div>
        </div>
    </section>
</template>

<script>
import axios from 'axios'
export default {
    data() {
        return {
            zam_wtoku: [],
            zam_odebrane: [],
            orders: [],
            nieodebrane: 0,
            id: '',
            id_płatności: '',
            kupujący_email: '',
            kupujący_telefon: '',
            kupujący_imię: '',
            kupujący_nazwisko: '',
            dostawa: false,
            dostawa_ulica: '',
            dostawa_kod_pocztowy: '',
            dostawa_miejscowość: '',
            ilość_przedmiotów: 0,
            łączna_wartość: 0.00,
            wiadomość: '',
            data_zamówienia: new Date(),
            przedmioty: [],
            odebrane: false,
            choice: 0,
            liczba: 0,
            notif: false,
        }
    },
    async created() {
        await this.getOrders()
        setInterval(async () => {
            await this.getOrders();
        }, 10000);
    },
    methods: {
        orders_w_toku() {
            this.choice = 0
            this.notif = false
            this.getOrders()
        },
        orders_odebrane() {
            this.choice = 1
            this.notif = false
            this.getOrders()
        },
        async ordersAll() {
            const { data: orders } = await axios.get('/order/main/')
            return orders
        },
        async getOrders() {
            this.orders = await this.ordersAll()

            for (let i = 0; i < this.orders.length; i++) {
                if (this.orders[i].panel_odebrane === true) {
                    this.zam_odebrane.push(this.orders[i])
                } else {
                    this.zam_wtoku.push(this.orders[i])
                }
            }

            this.nieodebrane = 0
            for (let i = 0; i < this.orders.length; i++) {
                if (this.orders[i].panel_odebrane === false) {
                    this.nieodebrane++
                }
            }

            if (this.choice === 0) {
                this.orders = this.zam_wtoku
                if (this.orders.length !== this.liczba && this.notif) {
                    this.notification('/notification.mp3')
                }
                this.liczba = this.orders.length
            } else {
                this.orders = this.zam_odebrane
                this.liczba == this.orders.length
                if (this.orders.length !== this.liczba && this.notif) {
                    this.notification('/notification.mp3')
                }
                this.liczba = this.orders.length
            }
            this.notif = true;
            
            this.zam_odebrane = []
            this.zam_wtoku = []

            if (this.orders.length > 0) {
                if (this.id !== '') {
                    this.id = this.id
                    this.id_płatności = this.id_płatności
                    this.kupujący_imię = this.kupujący_imię
                    this.kupujący_nazwisko = this.kupujący_nazwisko
                    this.kupujący_email = this.kupujący_email
                    this.kupujący_telefon = this.kupujący_telefon
                    this.dostawa = this.dostawa
                    this.dostawa_ulica = this.dostawa_ulica
                    this.dostawa_kod_pocztowy = this.dostawa_kod_pocztowy
                    this.dostawa_miejscowość = this.dostawa_miejscowość
                    this.ilość_przedmiotów = this.przedmioty.length
                    this.łączna_wartość = this.łączna_wartość
                    this.wiadomość = this.wiadomość
                    this.data_zamówienia = this.data_zamówienia
                    this.przedmioty = this.przedmioty
                    this.odebrane = this.odebrane
                } else {
                    this.id = this.orders[0].id
                    this.id_płatności = this.orders[0].id_płatności
                    this.kupujący_imię = this.orders[0].kupujący_imię
                    this.kupujący_nazwisko = this.orders[0].kupujący_nazwisko
                    this.kupujący_email = this.orders[0].kupujący_email
                    this.kupujący_telefon = this.orders[0].kupujący_telefon
                    this.dostawa = this.orders[0].dostawa
                    this.dostawa_ulica = this.orders[0].dostawa_ulica
                    this.dostawa_kod_pocztowy = this.orders[0].dostawa_kod_pocztowy
                    this.dostawa_miejscowość = this.orders[0].dostawa_miejscowość
                    this.ilość_przedmiotów = this.orders[0].przedmioty.length
                    this.łączna_wartość = this.orders[0].łączna_wartość
                    this.wiadomość = this.orders[0].wiadomość
                    this.data_zamówienia = this.orders[0].data_zamówienia
                    this.przedmioty = this.orders[0].przedmioty
                    this.odebrane = this.orders[0].panel_odebrane
                }
            } else if (this.orders.length === 0) {
                this.id = ''
                this.id_płatności = ''
                this.kupujący_imię = ''
                this.kupujący_nazwisko = ''
                this.kupujący_email = ''
                this.kupujący_telefon = ''
                this.dostawa = false
                this.dostawa_ulica = ''
                this.dostawa_kod_pocztowy = ''
                this.dostawa_miejscowość = ''
                this.ilość_przedmiotów = 0
                this.łączna_wartość = 0
                this.wiadomość = ''
                this.data_zamówienia = new Date()
                this.przedmioty = 0
                this.odebrane = false
            }

            for (let i = 0; i < this.orders.length; i++) {
                const date = new Date(this.orders[i].data_zamówienia);
                const options = {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                };
                const formattedDate = date.toLocaleString('en-GB', options);

                this.orders[i].data_zamówienia = formattedDate
            }
            

        },
        change(id) {
            const order = this.orders.find(obj => obj.id === id)
            this.id = order.id
            this.id_płatności = order.id_płatności
            this.kupujący_imię = order.kupujący_imię
            this.kupujący_nazwisko = order.kupujący_nazwisko
            this.kupujący_email = order.kupujący_email
            this.kupujący_telefon = order.kupujący_telefon
            this.dostawa = order.dostawa
            this.dostawa_ulica = order.dostawa_ulica
            this.dostawa_kod_pocztowy = order.dostawa_kod_pocztowy
            this.dostawa_miejscowość = order.dostawa_miejscowość
            this.ilość_przedmiotów = order.przedmioty.length
            this.łączna_wartość = order.łączna_wartość
            this.wiadomość = order.wiadomość
            this.data_zamówienia = order.data_zamówienia
            this.przedmioty = order.przedmioty
            this.odebrane = order.panel_odebrane
        },
        async complete(id) {
            const {data:order} = await axios.post('/order/odbior/', {id:id})
            this.odebrane = true
            if (order) {
                await this.getOrders()
            }

        },
        notification(url) {
            let audio = new Audio(url)
            audio.play()
        }
    }
}
</script>