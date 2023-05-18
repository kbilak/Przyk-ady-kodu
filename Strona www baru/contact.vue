<template>
    <main class="w-screen h-max 2xl:py-20 xl:py-20 lg:py-10 md:py-10 sm:py-5 xs:py-5 text-pblack">
        <section class="h-full mx-auto px-4 sm:px-6 lg:px-8 sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl flex items-center">
            <div class="relative z-50 min-h-[600px] w-full" style="background-image: url('/images/background/bambus_maly_op.png');background-size: contain;background-position: left;">
                <div class="flex justify-between w-full items-center align-middle
                2xl:flex-row xl:flex-row lg:flex-row md:flex-row sm:flex-col xs:flex-col"> 
                    <ClientOnly>
                        <article class="2xl:w-1/2 xl:w-1/2 lg:w-1/2 md:w-1/2 sm:w-full xs:w-full flex flex-col justify-center align-middle 
                            2xl:pr-20 xl:pr-20 lg:pr-20 md:pr-10 sm:pr-0 xs:pr-0">
                            <span class="2xl:text-6xl xl:text-5xl lg:text-5xl md:text-4xl sm:text-5xl xs:text-4xl
                            font-merienda 2xl:mb-10 xl:mb-10 lg:mb-10 md:mb-8 sm:mb-10 xs:mb-10 
                            2xl:text-left xl:text-left lg:text-left md:text-left sm:text-center xs:text-center">Lorem, ipsum dolor.</span>
                            <span class="2xl:text-xl xl:text-lg md:text-md sm:text-xl xs:text-lg 
                            2xl:text-left xl:text-left lg:text-left md:text-left sm:text-center xs:text-center
                            2xl:mb-5 md:mb-3 sm:mb-5 xs:mb-5">Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius enim eum earum?</span>
                            <span class="2xl:text-xl xl:text-lg md:text-md sm:text-xl xs:text-lg 
                            2xl:text-left xl:text-left lg:text-left md:text-left sm:text-center xs:text-center
                            2xl:mb-0 xl:mb-0 lg:mb-0 md:mb-0 sm:mb-10 xs:mb-10 ">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aspernatur ducimus asperiores facilis amet quibusdam.</span>
                        </article>
                        <v-form ref="form" v-model="valid" class="2xl:w-1/2 xl:w-1/2 lg:w-1/2 md:w-1/2 sm:w-full xs:w-full 2xl:p-10 xl:p-10 lg:p-10 md:p-10 sm:p-5 xs:p-5 pr-0">
                            <v-text-field v-model="fullName" label="Imię i nazwisko*" :rules="fullNameRules"></v-text-field>
                            <div class="w-full flex flex-row justify-between">
                                <section class="w-[48%]">
                                    <v-text-field type="email" v-model="email" label="E-mail*" :rules="emailRules"></v-text-field>
                                </section>
                                <section class="w-[48%]">
                                    <v-text-field type="tel" v-model="phone" label="Telefon"></v-text-field>
                                </section>
                            </div>
                            <v-textarea v-model="message" label="Wiadomość*" :rules="messageRules"></v-textarea>
                            <button type="button" v-if="!valid" disabled class="h-[50px] w-[100%] mt-3 flex flex-row justify-center items-center transition ease-in-out bg-pgreen-dark py-2.5 max-[639px]:py-2 text-white text-base 2xl:text-lg xl:text-lg px-7 max-[639px]:px-1 rounded-xl text-center font-bold font-raleway" style="cursor:not-allowed;"
                                :class="{ 'cursor-not-allowed': isLoading }">
                                <template v-if="isLoading">
                                    <div class="spinner"></div>
                                </template>
                                <template v-else>
                                    Wyślij wiadomość
                                    <svg aria-hidden="true" class="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd"
                                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                </template>
                            </button>
                            <button type="button" v-else class="h-[50px] w-[100%] mt-3 flex flex-row justify-center items-center transition ease-in-out bg-pgreen hover:bg-pgreen-dark py-2.5 max-[639px]:py-2 text-white text-base 2xl:text-lg xl:text-lg px-7 max-[639px]:px-1 rounded-xl text-center font-bold font-raleway"
                                :class="{ 'cursor-not-allowed': isLoading }" @click="submit">
                                <template v-if="isLoading">
                                    <div class="spinner"></div>
                                </template>
                                <template v-else>
                                    {{ this.buttonMsg }}
                                    <svg aria-hidden="true" class="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd"
                                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                </template>
                            </button>
                        </v-form>
                    </ClientOnly>
                </div>

                <div class="mt-10 flex flex-col items-center">
                    <span class="text-3xl font-merienda text-center w-full mb-5">Gdzie dostarczamy?</span>
                    <iframe src="https://www.google.com/maps/d/embed?mid=1t-Inn7CL8TquMcCGZ_FewUki91CZqwM&ehbc=2E312F" width="100%"
                        height="600"></iframe>
                </div>
            </div>
        </section>
    </main>
</template>

<script>
import axios from 'axios'
export default {
    data() {
        return {
            buttonMsg: 'Wyślij wiadomość',
            isLoading: false,
            fullName: "",
            phone: "",
            email: "",
            message: "",
            valid: false,
            fullNameRules: [
                v => !!v || "Imię i nazwisko są wymagane.",
                v => (v && v.length >= 3) || "Imię i nazwisko muszą mieć co najmniej 3 znaki!"
            ],
            emailRules: [
                v => !!v || "E-mail jest wymagany.",
                v => /.+@.+\..+/.test(v) || "E-mail musi być w prawidłowej formie."
            ],
            messageRules: [
                v => !!v || "Wiadomość jest wymagana",
                v => (v && v.length >= 10 || "Wiadomość jest za krótka.")
            ]
        }
    },
    methods: {
        async submit() {
            this.$refs.form.validate().then(async valid => {
                if (valid) {
                    this.isLoading = true;
                    let form = {
                        imię_nazwisko: this.fullName,
                        email: this.email,
                        telefon: this.phone,
                        wiadomość: this.message
                    };
                    try {
                        const config = {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        };
                        const {data:response} = await axios.post('/form/contact/', form, config)
                        if (response.success) {
                            this.isLoading = false;
                            this.buttonMsg = 'Wiadomość wysłana poprawnie!';
                            setTimeout(() => {
                                this.buttonMsg = 'Wyślij wiadomość';
                            }, 3000);
                        } else {
                            this.isLoading = false;
                            this.buttonMsg = 'Wystąpił błąd! Spróbuj ponownie.';
                            setTimeout(() => {
                                this.buttonMsg = 'Wyślij wiadomość';
                            }, 3000);
                        }
                    } catch (error) {
                        this.isLoading = false;
                        this.buttonMsg = 'Wystąpił błąd! Spróbuj ponownie.';
                        setTimeout(() => {
                            this.buttonMsg = 'Wyślij wiadomość';
                        }, 3000);
                    }
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

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>