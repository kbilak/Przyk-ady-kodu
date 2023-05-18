<template>
    <main class="w-screen h-max 2xl:py-20 xl:py-20 lg:py-10 md:py-10 sm:py-5 xs:py-5 text-pblack">
        <section class="h-full mx-auto px-4 sm:px-6 lg:px-8 sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl flex items-center">
            <div class="relative z-50 flex justify-between w-full flex-col">
                <div class="flex w-full 2xl:flex-row xl:flex-row lg:flex-row md:flex-col sm:flex-col xs:flex-col
            items-start align-middle justify-between">
                    <article class="2xl:w-[58%] xl:w-[58%] lg:w-[58%] md:w-full sm:w-full xs:w-full bg-white h-auto 
                    2xl:p-10 xl:p-10 lg:p-10 md:p-10 sm:p-5 xs:p-5 flex 
                    flex-col 2xl:mb-0 xl:mb-0 lg:mb-0 md:mb-5 sm:mb-5 xs:mb-5">
                        <span class="text-2xl text-pblack-light font-raleway">Twoje dane</span>
                        <ClientOnly >
                            <v-radio-group class="py-5" v-model="choice">
                                <v-radio value="o" @click="this.city = ''" label="Odbiór osobisty"></v-radio>
                                <v-radio v-if="cartStore.getFullPrice() >= 30.00" value="d" @click="this.city = 'Rumia'" label="Dostawa pod adres"></v-radio>
                            </v-radio-group>
                            <v-form ref="form" v-model="valid">
                                <div class="flex flex-row w-full justify-between">
                                    <section class="w-[48%]">
                                        <v-text-field v-model="name" label="Imię*" :rules="nameRules"></v-text-field>
                                    </section>
                                    <section class="w-[48%]">
                                        <v-text-field v-model="surname" label="Nazwisko*" :rules="surnameRules"></v-text-field>
                                    </section>
                                </div>
                                <div class="flex flex-row w-full justify-between" v-if="choice == 'd'">
                                    <section class="w-[48%]">
                                        <v-select v-if="cartStore.getFullPrice() >= 30.00 && cartStore.getFullPrice() <= 69.99" v-model="city" label="Miejscowość*" :items="cities"></v-select>
                                        <v-select v-else v-model="city" label="Miejscowość*" :items="citiesAbove70"></v-select>
                                    </section>
                                    <section class="w-[48%]">
                                        <v-select v-model="streetGdynia" label="Ulica - Gdynia*" v-if="city == 'Gdynia'"
                                            :items="streetsGdynia"></v-select>
                                        <v-select v-model="streetDebogorze" default="Dębogórska" label="Ulica - Dębogórze Wybudowanie*"
                                            v-if="city == 'Dębogórze Wybudowanie'" :items="streetsDebogorze"></v-select>
                                        <v-text-field v-if="city == 'Reda' || city == 'Rumia'" v-model="street" label="Ulica*"
                                            :rules="streetRules"></v-text-field>
                                        <v-text-field v-model="noStreet" label="Ulica*" v-if="city == ''"></v-text-field>
                                    </section>
                                </div>
                                <div class="flex flex-row w-full justify-between" v-if="choice == 'd'">
                                    <section class="w-[48%]">
                                        <v-text-field v-model="number" label="Numer domu*"
                                            :rules="numberRules"></v-text-field>
                                    </section>
                                    <section class="w-[48%]">
                                        <v-text-field v-model="zip" label="Kod poczowy*" :rules="zipRules"></v-text-field>
                                    </section>
                                </div>
                                <div class="flex flex-row w-full justify-between">
                                    <section class="w-[48%]">
                                        <v-text-field type="email" v-model="email" label="E-mail*" :rules="emailRules"></v-text-field>
                                    </section>
                                    <section class="w-[48%]">
                                        <v-text-field type="tel" v-model="phone" label="Telefon*" :rules="phoneRules"></v-text-field>
                                    </section>
                                </div>
                                <v-textarea v-model="message" label="Uwagi do zamówienia"></v-textarea>
                            </v-form>
                        </ClientOnly>
                        <span class="text-2xl text-pblack-light font-raleway">Dodatki</span>
                        <v-checkbox v-model="reklamowka" hide-details color="#8cbf3e" label="Reklamówka (+1.00zł)"></v-checkbox>
                        <v-checkbox v-model="paleczki" hide-details color="#8cbf3e" label="Pałeczki (+1.00zł)"></v-checkbox>
                        <v-checkbox v-model="sztucce" hide-details color="#8cbf3e" label="Sztućce (0.00zł)"></v-checkbox>
                    </article>
                    <article class="2xl:w-[38%] xl:w-[38%] lg:w-[38%] md:w-full sm:w-full xs:w-full bg-white h-auto 2xl:p-10 xl:p-10 lg:p-10 md:p-10 sm:p-5 xs:p-5 flex flex-col">
                        <span class="text-2xl text-pblack-light font-raleway">Podsumowanie zamówienia</span>
                        <span class="pb-5 pt-3 text-gray-500">Łączna wartość Twojego zamówienia powiększona o koszt dostawy (zawiera podatek VAT)</span>
                        <hr>
                        <div class="py-3 flex flex-row justify-between">
                            <span>Zamówienie</span>
                            <span class="font-bold">{{ cartStore.getFullPrice() }}zł</span>
                        </div>
                        <div v-if="choice == 'o'" class="py-3 flex flex-row justify-between">
                            <div class="flex flex-col">
                                <span>Dostawa</span>
                                <span class="text-sm text-grey">Minimalna wartość zamówienia:</span>
                                <span class="text-sm text-grey">Rumia, Gdynia, Dębogórze Wybudowanie - 35zł</span>
                                <span class="text-sm text-grey">Reda - 70zł</span>
                            </div>
                            <span class="font-bold">0.00zł</span>
                        </div>
                        <div v-else class="py-3 flex flex-row justify-between">
                            <div class="flex flex-col">
                                <span>Dostawa</span>
                                <span class="text-sm text-grey">Minimalna wartość zamówienia:</span>
                                <span class="text-sm text-grey">Rumia, Gdynia, Dębogórze Wybudowanie - 35zł</span>
                                <span class="text-sm text-grey">Reda - 70zł</span>
                            </div>
                            <span class="font-bold">{{ dostawa.toFixed(2) }}zł</span>
                        </div>
                        <hr>
                        <div class="py-3 flex flex-row justify-between">
                            <span>Łącznie</span>
                            <span class="font-bold text-xl text-pgreen">{{ (parseInt(cartStore.getFullPrice()) + parseInt(dostawa) + parseInt(dodatkiKoszt)).toFixed(2) }}zł</span>
                        </div>
                        <button type="button" v-if="!valid || cartStore.getFullPrice() == 0" disabled
                            class="h-[50px] w-[100%] mt-3 flex flex-row justify-center items-center transition ease-in-out bg-pgreen-dark py-2.5 max-[639px]:py-2 text-white text-base 2xl:text-lg xl:text-lg px-7 max-[639px]:px-1 rounded-xl text-center font-bold font-raleway"
                            style="cursor:not-allowed;" :class="{ 'cursor-not-allowed': isLoading }">
                            <template v-if="isLoading">
                                <div class="spinner"></div>
                            </template>
                            <template v-else>
                                Zamawiam i płacę bezpiecznie z
                                <img src="/images/logo/PAYU_LOGO_WHITE.png" class="h-[40px]" alt="logo payu">
                            </template>
                        </button>
                        <button type="button" v-else
                            class="h-[50px] w-[100%] mt-3 flex flex-row justify-center items-center transition ease-in-out bg-pgreen hover:bg-pgreen-dark py-2.5 max-[639px]:py-2 text-white text-base 2xl:text-lg xl:text-lg px-7 max-[639px]:px-1 rounded-xl text-center font-bold font-raleway"
                            :class="{ 'cursor-not-allowed': isLoading }" @click="submit">
                            <template v-if="isLoading">
                                <div class="spinner"></div>
                            </template>
                            <template v-else>
                                Zamawiam i płacę bezpiecznie z
                                <img src="/images/logo/PAYU_LOGO_WHITE.png" class="h-[40px]" alt="logo payu">
                            </template>
                        </button>
                    </article>
                </div>
                <div class="mt-10 flex flex-col items-center">
                    <span class="text-3xl font-merienda text-center w-full mb-5">Gdzie dostarczamy?</span>
                    <iframe src="https://www.google.com/maps/d/embed?mid=1t-Inn7CL8TquMcCGZ_FewUki91CZqwM&ehbc=2E312F" width="100%" height="600"></iframe>
                </div>
            </div>
        </section>
    </main>
</template>

<script>
import axios from 'axios'
export default {
    setup() {
        return {
            cartStore: useCartStore(),
        }
    },
    data() {
        return {
            reklamowka: false,
            paleczki: false,
            sztucce: false,
            dodatkiKoszt: 0,
            isLoading: false,
            choice: 'o',
            noStreet: '',
            cities: ['Rumia', 'Dębogórze Wybudowanie', 'Gdynia'],
            citiesAbove70: ['Rumia', 'Reda', 'Dębogórze Wybudowanie', 'Gdynia'],
            streetsGdynia: ['Hutnicza', 'Północna', 'Handlowa'],
            streetGdynia: 'Hutnicza',
            streetsDebogorze: ['Dębogórska', 'Długa', 'Łąkowa', 'Piaskowa', 'Prywatna', 'Leśna'],
            streetDebogorze: 'Dębogórska',
            name: "",
            surname: "",
            street: "",
            city: "",
            zip: "",
            number: "",
            phone: "",
            email: "",
            message: "",
            valid: false,
            nameRules: [
                v => !!v || "Imię jest wymagane",
                v => (v && v.length >= 3) || "Imię musi mieć co najmniej 3 znaki!"
            ],
            surnameRules: [
                v => !!v || "Nazwisko jest wymagane",
                v => (v && v.length >= 3) || "Nazwisko musi mieć co najmniej 3 znaki!"
            ],
            streetRules: [
                v => !!v || "Ulica jest wymagana",
                v => (v && v.length >= 3) || "Ulica musi mieć przynajmniej 3 znaki!"
            ],
            cityRules: [
                v => !!v || "Miejscowość jest wymagana",
            ],
            numberRules: [
                v => !!v || "Numer jest wymagany",
                v => (v && v.length >= 1) || "Proszę podać numer."
            ],
            zipRules: [
                v => !!v || "Kod pocztowy jest wymagany",
                v => (v && v.length >= 5) || "Kod pocztowy jest za krótki!"
            ],
            phoneRules: [
                v => !!v || "Numer telefonu jest wymagany",
                v => (v && v.length >= 9 && v.length <= 16) || "Numer telefonu musi mieć co od 9 do 16 cyfr!"
            ],
            emailRules: [
                v => !!v || "E-mail jest wymagany",
                v => /.+@.+\..+/.test(v) || "E-mail musi być poprawny!"
            ],
            form: {}
        }
    },
    created() {
        let arrayOfProducts = [];
        for (let i = 0; i < this.cartStore.items.length; i++) {
            // string z dodatkami
            let itemAdds = '';
            // string z ceną + cena dodatków
            let itemPrice = 0;
            for (let j = 0; j < this.cartStore.items[i].dodatki.length; j++) {
                itemAdds = this.cartStore.items[i].dodatki[j].nazwa + ', ' + itemAdds;
                itemPrice = parseInt(this.cartStore.items[i].dodatki[j].cena) + itemPrice;
            }
            itemAdds = itemAdds.slice(0, -2)
            itemPrice = (itemPrice + this.cartStore.items[i].item.cena) * 100
            if (itemAdds.length > 0) {
                arrayOfProducts.push({ "name": this.cartStore.items[i].item.nazwa + ', DODATKI: ' + itemAdds, "unitPrice": itemPrice, "quantity": this.cartStore.items[i].ammount },)
            } else {
                arrayOfProducts.push({ "name": this.cartStore.items[i].item.nazwa, "unitPrice": itemPrice, "quantity": this.cartStore.items[i].ammount },)
            }
        }
    },
    computed: {
        dostawa() {
            if (this.city === 'Reda') {
                return 12.00;
            } else if (this.choice === 'o') {
                return 0.00
            } else {
                return 10.00;
            }
        },
        dodatkiKoszt() {
            if (this.reklamowka && !this.paleczki) {
                return 1.00
            } else if (this.paleczki && !this.reklamowka) {
                return 1.00
            } else if (this.reklamowka && this.paleczki) {
                return 2.00
            } else if (!this.reklamowka && !this.paleczki) {
                return 0.00
            }
        },
    },
    watch: {
        city() {
            this.dostawa = this.calculateDostawa();
        },
        dodatkiKoszta() {
            this.dodatkiKoszt = this.calculateDodatki()
        }

    },
    methods: {
        calculateDostawa() {
            if (this.city === 'Reda') {
                return 12.00;
            } else if (this.choice === 'o') {
                this.city = ''
                return 0.00
            } else {
                return 10.00;
            }
        },
        calculateDodatki() {
            if (this.reklamowka && !this.paleczki) {
                return 1.00
            } else if (this.paleczki && !this.reklamowka) {
                return 1.00
            } else if (this.reklamowka && this.paleczki) {
                return 2.00
            } else if (!this.reklamowka && !this.paleczki) {
                return 0.00
            }
        },
        async generateAccessToken() {
            const response = await axios.get(
                '/order/payment/token/'
            )
            return response.data.access_token
        },
        async submit() {
            this.$refs.form.validate().then(async valid => {
                if (valid) {
                    this.isLoading = true;
                    if (this.choice === 'd') {
                        if (this.city === 'Dębogórze Wybudowanie') {
                            this.form = {
                                "postalCode": this.zip,
                                "city": this.city,
                                "street": this.streetDebogorze + ' ' + this.number,
                            };
                        } else if (this.city === 'Gdynia') {
                            this.form = {
                                "postalCode": this.zip,
                                "city": this.city,
                                "street": this.streetGdynia + ' ' + this.number,
                            };
                        } else {
                            this.form = {
                                "postalCode": this.zip,
                                "city": this.city,
                                "street": this.street + ' ' + this.number,
                            };
                        }
                    } else {
                        this.form = {};
                    }
                    try {
                        let arrayOfProducts = [];

                        if (this.reklamowka) {
                            arrayOfProducts.push({ 'name': '+ REKLAMÓWKA', "quantity": 1, "unitPrice": 100 })
                        }
                        if (this.sztucce) {
                            arrayOfProducts.push({ 'name': '+ SZTUĆCE', "quantity": 1, "unitPrice": 100 })
                        } 
                        if (this.paleczki) {
                            arrayOfProducts.push({ 'name': '+ PAŁECZKI', "quantity": 1, "unitPrice": 100 })
                        }
                        for (let i = 0; i < this.cartStore.items.length; i++) {
                            // string z dodatkami
                            let itemAdds = '';
                            // string z ceną + cena dodatków
                            let itemPrice = 0;
                            for (let j = 0; j < this.cartStore.items[i].dodatki.length; j++) {
                                itemAdds = this.cartStore.items[i].dodatki[j].nazwa + ', ' + itemAdds;
                                itemPrice = parseInt(this.cartStore.items[i].dodatki[j].cena) + itemPrice;
                            }
                            itemAdds = itemAdds.slice(0, -2)
                            itemPrice = (itemPrice + this.cartStore.items[i].item.cena) * 100

                            if (itemAdds.length > 0) {
                                arrayOfProducts.push({ "name": this.cartStore.items[i].item.nazwa + ', DODATKI: ' + itemAdds, "unitPrice": itemPrice, "quantity": this.cartStore.items[i].ammount },)
                            } else {
                                arrayOfProducts.push({ "name": this.cartStore.items[i].item.nazwa, "unitPrice": itemPrice, "quantity": this.cartStore.items[i].ammount },)
                            }
                        }
                        const accessToken = await this.generateAccessToken()
                        const totalAmmount = (parseInt(this.cartStore.getFullPrice()) + parseInt(this.dostawa) + parseInt(this.calculateDodatki())) * 100
                        const delivery = this.choice === 'o' ? false : true;
                        const id = Array(17).join().replace(/(,)/g, () => Math.floor(Math.random() * 10));

                        const body = {
                            token: accessToken,
                            message: this.message,
                            choice: delivery,
                            data: {
                                "extOrderId": id,
                                "continueUrl": "/zamowienie",
                                "notifyUrl": "/order/payment/status/",
                                "customerIp": "127.0.0.1",
                                "merchantPosId": "461165",
                                "description": "Zamówienie - Sklep internetowy",
                                "currencyCode": "PLN",
                                "totalAmount": totalAmmount,
                                "buyer": {
                                    "email": this.email,
                                    "phone": this.phone,
                                    "firstName": this.name,
                                    "lastName": this.surname,
                                    "language": "pl",
                                    "delivery": this.form
                                },
                                "products": arrayOfProducts,
                            }
                        }
                        const response = await axios.post(
                            'order/payment/new/',
                            body
                        )
                        window.location = response.data;
                    } catch (error) {
                        console.error(error)
                    }
                    this.isLoading = false;
                } else {
                    console.log('error')
                }
            });
        },
    }
}
</script>

<style>
.v-textarea {
    max-height: 300px;
    overflow-y: hidden;
}

.spinner {
    border: 2px solid #fff;
    border-top: 2px solid #6a902f;
    border-radius: 50%;
    width: 1em;
    height: 1em;
    animation: spin 1s linear infinite;
}

.v-checkbox {
    height: 40px !important;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>