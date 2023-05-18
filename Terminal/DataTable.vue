<template>
    <div>
        <v-card class="table-main">
            <v-overlay :value="loading">
                <v-progress-circular indeterminate size="64"></v-progress-circular>
            </v-overlay>
            <v-text-field data-disable-touch-keyboard v-model="search" append-icon="mdi-magnify"
                label="Search datatable..." single-line hide-details class="table-fileter"
                style="padding:8px 20px;display:inline;font-size:20px">
            </v-text-field>
            <v-data-table :headers="headers" :items="items" :page.sync="page" :item-key="itemKey"
                :items-per-page="itemsPerPage" :search="search" @page-count="pageCount = $event" mobile-breakpoint="300"
                loading-text="Loading..." hide-default-footer style="min-height:478px">
                <template v-slot:[`item.name`]="{ item, index }">
                    <v-dialog :key="item._id" v-model="dialogItem[index]" fullscreen hide-overlay
                        transition="dialog-bottom-transition" :retain-focus="false">
                        <template v-slot:activator="{ on, attrs }">
                            <div v-if="item.collection === 'items'" v-bind="attrs" v-on="on">
                                <v-list-item-title color="primary" large
                                    style="text-overflow:ellipsis;max-width:120px;font-size:20px;padding:0">
                                    {{item.name}}
                                </v-list-item-title>
                                <v-list-item-subtitle v-if="showBarcode">
                                    <v-icon>mdi-barcode</v-icon>{{item.barcode}}
                                </v-list-item-subtitle>
                            </div>
                            <v-list-item-title v-if="item.collection === 'deliveries'" v-bind="attrs" v-on="on"
                                color="orange" large style="text-overflow:ellipsis;max-width:200px;font-size:20px">
                                {{item.name}}
                            </v-list-item-title>
                            <div v-if="item.collection === 'transactions'" v-bind="attrs" v-on="on">
                                <v-list-item-title v-if="item.collection === 'transactions'" color="green" large
                                    style="text-overflow:ellipsis;max-width:200px;font-size:20px">
                                    {{item.name}}
                                </v-list-item-title>
                                <v-list-item-subtitle>
                                    <v-icon>mdi-calendar-check</v-icon>{{item.created}}
                                </v-list-item-subtitle>
                            </div>
                        </template>
                        <v-card tile>
                            <v-toolbar v-if="item.collection === 'items'" dark color="primary" class="flex-grow-0">
                                <v-btn icon dark @click="closeDialogItem(index)">
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                                <v-toolbar-title>{{item.name}}</v-toolbar-title>
                                <v-spacer></v-spacer>
                            </v-toolbar>
                            <v-toolbar v-if="item.collection === 'deliveries'" dark color="orange" class="flex-grow-0">
                                <v-btn icon dark @click="closeDialogItem(index)">
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                                <v-toolbar-title>{{item.name}}</v-toolbar-title>
                                <v-spacer></v-spacer>
                            </v-toolbar>
                            <v-toolbar v-if="item.collection === 'transactions'" dark color="green" class="flex-grow-0">
                                <v-btn icon dark @click="closeDialogItem(index)">
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                                <v-toolbar-title>{{item.name}}</v-toolbar-title>
                                <v-spacer></v-spacer>
                            </v-toolbar>
                            <v-card-text>
                                <v-container v-if="item.collection === 'items'">
                                    <ItemDetails :itemItem="item"></ItemDetails>
                                </v-container>
                                <v-container v-if="item.collection === 'deliveries'">
                                    <DeliveryDetails :deliveryItem="item"></DeliveryDetails>
                                </v-container>
                                <v-container v-if="item.collection === 'transactions'">
                                    <TransactionDetails :transactionItem="item"></TransactionDetails>
                                </v-container>
                            </v-card-text>
                        </v-card>
                    </v-dialog>
                </template>
                <template v-slot:[`item.location`]="{ item }">
                    <v-list-item-title style="font-size:18px">{{item.location}}</v-list-item-title>
                </template>
                <template v-slot:[`item.priority`]="{ item }">
                    <v-text-field data-disable-touch-keyboard :key="item._id" v-model.number="item.priority"
                        :value="item.priority" flat solo
                        style="max-width:140px;max-height:51px;margin:3px 0 3px 0;font-size:20px;border:1px solid lightgrey;padding: 0;">
                    </v-text-field>
                </template>
                <template v-if="editValue === 'location'" v-slot:[`item.${editValue}`]="{ item }">
                    <v-text-field data-disable-touch-keyboard label="New bin" :key="item._id"
                        @change="editValueSaveL(item)" v-model="item.bin" :value="item.bin" flat solo
                        style="max-width:140px;max-height:51px;margin:3px 0 3px 0;font-size:18px;border:1px solid lightgrey;padding: 0;">
                    </v-text-field>
                </template>
                <template v-else-if="editValue === 'bin'" v-slot:[`item.${editValue}`]="{ item }">
                    <v-text-field data-disable-touch-keyboard label="New bin" :key="item._id"
                        @change="editValueSaveL(item)" v-model="item.bin" :value="item.bin" flat solo
                        style="max-width:90px;max-height:51px;font-size:18px;border:1px solid lightgrey;padding: 0;">
                    </v-text-field>
                </template>
                <template v-else-if="editValue === 'weight'" v-slot:[`item.${editValue}`]="{ item }">
                    <v-text-field data-disable-touch-keyboard :key="item._id" @change="editValueSaveW(item)"
                        v-model="item.weight" flat solo
                        style="max-width:110px;max-height:51px;margin:3px 0 3px 0;font-size:20px;border:1px solid lightgrey;">
                    </v-text-field>
                </template>
                <template v-if="editValue2 === 'quantityonhandedit'" v-slot:[`item.${editValue2}`]="{ item }">
                    <v-text-field data-disable-touch-keyboard :key="item._id" @keyup.enter="editValueSaveQty(item)"
                        :value="item.quantityonhand" :v-model="item.quantityonhand" flat solo
                        style="max-width:110px;max-height:51px;margin:3px 0 3px 0;font-size:20px;border:1px solid lightgrey;">
                    </v-text-field>
                </template>
                <template v-slot:[`item.quantityonhand`]="{ item }">
                    <v-list-item-title style="font-size:18px">{{ item.quantityonhand }}</v-list-item-title>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                    <v-select :key="item._id" @change="saveSelect(item)" v-model="item.status" :items="selectItems"
                        item-text="name" item-value="_id" flat solo
                        style="max-width:170px;max-height:51px;margin:3px 0 3px 0;font-size:20px;border:1px solid lightgrey;font-size: 15px;">
                    </v-select>
                </template>
                <template v-slot:[`item.shipaddressee`]="{ item }">
                    <span style="font-size:12px;max-width:100px;">{{ item.shipaddressee }}</span>
                </template>
            </v-data-table>
            <div>
                <v-pagination v-model="page" :length="pageCount"></v-pagination>
            </div>
        </v-card>
        <v-snackbar v-model="snackbar" :timeout="snackTimeout">
            {{snackText}}
            <template v-slot:action="{ attrs }">
                <v-btn color="error" text v-bind="attrs" @click="snackbar = false">
                    Close
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script>
    import service from '../../api/config';
    import ItemDetails from '../StockTaking/ItemDetails.vue';
    import DeliveryDetails from '../Receipts/DeliveryDetails.vue';
    import TransactionDetails from '../Releases/TransactionDetails.vue';
    export default {
    props: ["headers", "items", "itemsPerPage", "itemKey", "editValue", "editValue2", "showBarcode",],
        name: 'data-table',
        data() {
            return {
                loading: false,
                dialogItem: {},
                checkQty: 0,
                search: "",
                page: 1,
                pageCount: 0,
                snackbar: false,
                snackText: '',
                snackTimeout: 2000,
                newbin: '',
                quantity: '',
                transfer: {
                    bin: this.newbin,
                    location: '5e0dbaba9e33df43f0b3a495',
                },
                selectItems: [
                    { name: 'Ready To Pack', _id: 'readytopack' },
                    { name: 'Picked', _id: 'picked' },
                    { name: 'Packed', _id: 'packed' },
                    { name: 'Shipped', _id: 'shipped' },
                ],
                selectItemsRaw: ['readytopack', 'picked', 'packed', 'shipped'],
            };
        },
        methods: {
            closeDialogItem(index) {
                this.dialogItem[index] = false
            },
            async editValueSaveQty(item) {
                this.loading = true;
                if (!isNaN(parseInt(this.checkQty))) {
                    await service("POST", `items/stockcheck/${item._id}`, {quantityonhand:parseFloat(item.quantityonhand)})
                        .catch ((err) => {
                            this.loading = false;
                            this.snackText = err.message;
                            this.snackbar = true;
                            throw err;
                        })
                        .then((res) => {
                            this.loading = false;
                            this.snackText = 'Successfully checked qty';
                            this.snackbar = true;
                            return res;
                        })
                } else {
                    this.loading = false;
                    this.snackText = 'Input must be a number'
                    this.snackbar = true;
                }
            },
            async editValueSaveL(item) {
                this.loading = true;
                let recordBin = {
                    priority: item.priority,
                    frombin: this.transfer.bin,
                    bin: item.bin,
                    quantity: item.quantityonhand
                }
                await service("POST", `bin/transfer/${item._id}`, recordBin)
                    .catch((err) => {
                        this.loading = false;
                        this.snackText = err.message.message;
                        this.snackbar = true;
                        throw err;
                    })
                    .then((res) => {
                        this.loading = false;
                        this.snackText = 'Successfully updated bin';
                        this.snackbar = true;
                        return res;
                    })
            },
            async editValueSaveW(item) {
                this.loading = true;
                if (!isNaN(parseFloat(item.weight))) {
                    await service("PUT", `items/${item._id}`, {weight:parseFloat(item.weight)})
                        .catch((err) => {
                            this.loading = false;
                            this.snackText = err.message;
                            this.snackbar = true;
                            throw err;
                        })
                        .then((res) => {
                            this.loading = false;
                            this.snackText = 'Successfully updated weight'
                            this.snackbar = true;
                            return res;
                        })
                } else {
                    this.loading = false;
                    this.snackText = 'Input must be a number'
                    this.snackbar = true;
                }
            },
            async saveSelect(item) {
                this.loading = true;
                for (let i = 0; i <= this.selectItems.length - 1; i++) {
                    if (item.status === this.selectItems[i]) {
                        item.status = this.selectItemsRaw[i];
                        break;
                    }
                }
                await service("PUT", `transactions/${item._id}`, {status:item.status})
                    .catch((err) => {
                        this.loading = false;
                        this.snackText = err.message;
                        this.snackbar = true;
                        throw err;
                    })
                    .then((res) => {
                        this.loading = false;
                        this.snackText = 'Successfully changed status';
                        this.snackbar = true;
                        return res;
                    })
            }
        },
        components: { ItemDetails, DeliveryDetails, TransactionDetails }
    }
</script>