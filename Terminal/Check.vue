<template>
    <v-dialog v-model="dialog" fullscreen scrollable transition="dialog-bottom-transition">
        <template v-slot:activator="{ on, attrs }">
            <v-btn v-if="checkItem.collection === 'deliveries'" tile color="orange" class="ma-2" x-large dark
                v-bind="attrs" v-on="on">
                <v-icon dark right large>mdi-format-list-checks</v-icon>
            </v-btn>
            <v-btn v-else tile color="green" class="ma-2" x-large dark v-bind="attrs" v-on="on">
                <v-icon dark right large>mdi-format-list-checks</v-icon>
            </v-btn>
        </template>
        <v-card tile>
            <v-toolbar v-if="checkItem.collection === 'deliveries'" dark color="orange">
                <v-btn icon dark @click="closeDialog()">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Check: {{ checkItem.name }}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items>
                    <v-btn dark @click="saveRecord()" style="margin-right:30px">
                        <v-icon>mdi-content-save</v-icon>
                    </v-btn>
                    <v-btn :color="print ? 'success' : 'error'" @click="print = !print">
                        <v-icon>mdi-printer</v-icon>
                    </v-btn>
                </v-toolbar-items>
            </v-toolbar>
            <v-toolbar v-else dark color="green">
                <v-btn icon dark @click="closeDialog()">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Check: {{ checkItem.name }}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items>
                    <v-btn dark @click="saveRecord()" style="margin-right:30px">
                        <v-icon>mdi-content-save</v-icon>
                    </v-btn>
                </v-toolbar-items>
            </v-toolbar>
            <v-card-actions>
                <v-overlay :value="loading">
                    <v-progress-circular indeterminate size="64"></v-progress-circular>
                </v-overlay>
                <v-toolbar height="60" centered flat>
                    <v-row>
                        <v-text-field style="width: 20px" v-model="box" append-icon="mdi-package-variant-closed"
                            label="Box" single-line hide-details>
                        </v-text-field>
                        <v-spacer></v-spacer>
                        <v-text-field v-model="scan" append-icon="mdi-magnify" label="Barcode" single-line hide-details
                            v-on:keyup="decodeBarcode"></v-text-field>
                    </v-row>
                </v-toolbar>
            </v-card-actions>
            <v-card-text>
            <v-text-field data-disable-touch-keyboard v-model="search" append-icon="mdi-magnify" label="Search"
                single-line hide-details class="table-filter" style="padding:8px 20px;display:inline;"></v-text-field>
            <v-data-table :headers="headers" :items="items" :search="search" :custom-filter="filter" dense
                mobile-breakpoint="300" hide-default-footer disable-pagination
                :footer-props="{ disablePagination: true }" group-by="box" style="min-height:530px" disable-sort>
                <template v-slot:[`group.header`]="{ group, headers, isOpen, toggle }">
                    <tr :colspan="headers.length"
                        style="height: 40px;display: flex;align-items: center;font-size: 20px;">
                        <v-btn :ref="group" :data-open="isOpen" @click="toggle" small icon>
                            <v-icon v-if="isOpen">mdi-minus</v-icon>
                            <v-icon v-else>mdi-plus</v-icon>
                        </v-btn>
                        Box {{group}}
                    </tr>
                </template>
                <template v-for="(col, idx) in headers" v-slot:[`item.${col.value}`]="{ item, index }">
                    <v-dialog v-if="col.dialog && item[col.value]" :key="col.value" v-model="dialogItem[index]"
                        fullscreen hide-overlay transition="dialog-bottom-transition" :retain-focus="false">
                        <template v-slot:activator="{ on, attrs }" v-if="checkItem.collection === 'transactions'">
                            <v-list-item-title v-if="item.quantity !== item.quantitytopack"
                                style="padding:10px;font-size:20px;background-color: lightcoral;" v-bind="attrs"
                                v-on="on" color="primary" large>{{ item[col.value] }}</v-list-item-title>
                            <v-list-item-title v-else style="padding:10px;font-size:20px;" v-bind="attrs" v-on="on"
                                color="primary" large>{{ item[col.value] }}</v-list-item-title>
                        </template>
                        <template v-slot:activator="{ on, attrs }" v-else>
                            <v-list-item-title v-if="item.quantity !== item.quantitytopack"
                                style="padding:10px;font-size:20px;background-color: lightcoral;" v-bind="attrs"
                                v-on="on" color="primary" large>{{ item[col.value].displayname }}</v-list-item-title>
                            <v-list-item-title v-else style="padding:10px;font-size:20px;" v-bind="attrs" v-on="on"
                                color="primary" large>{{ item[col.value].displayname }}</v-list-item-title>
                        </template>
                        <v-card tile>
                            <v-toolbar dark color="primary" class="flex-grow-0">
                                <v-btn icon dark @click="closeDialogItem(index)">
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                                <v-toolbar-title v-if="checkItem.collection === 'transactions'">{{item.displayname}}
                                </v-toolbar-title>
                                <v-toolbar-title v-else>{{item.item.displayname}}</v-toolbar-title>
                                <v-spacer></v-spacer>
                            </v-toolbar>
                            <v-card-text v-if="checkItem.collection === 'transactions'">
                                <ItemDetails :key="item[col.value]._id" :itemItem="item.item">
                                </ItemDetails>
                            </v-card-text>
                            <v-card-text v-else>
                                <ItemDetails :key="item[col.value]._id" :itemItem="item.item">
                                </ItemDetails>
                            </v-card-text>
                        </v-card>
                    </v-dialog>
                    <span v-else :key="idx" style="font-size:15px;">{{ item[col.value] }}</span>
                </template>
                <template v-slot:[`item.quantity`]="{ item }">
                    <v-text-field data-disable-touch-keyboard v-model.number="item.quantity" type="number"
                        label="Scanned" :key="item.quantity" :value="item.quantity" flat solo
                        style="max-width:90px;max-height:51px;font-size:18px;border:1px solid lightgrey;padding: 0;">
                    </v-text-field>
                </template>
            </v-data-table>
            </v-card-text>
            <v-snackbar v-model="snackbar" :timeout="snackTimeout">
                {{snackText}}
                <template v-slot:action="{ attrs }">
                    <v-btn color="error" text v-bind="attrs" @click="snackbar = false">
                        Close
                    </v-btn>
                </template>
            </v-snackbar>
        </v-card>
    </v-dialog>
</template>
<script>
    import service from '../../api/config';
    import ItemDetails from '../StockTaking/ItemDetails.vue';
    export default {
        props: ["checkItem"],
        name: 'check-component',
        data () {
            return {
                print: false,
                user: '',
                snackbar: false,
                snackText: '',
                snackTimeout: 2000,
                loading: false,
                dialog: false,
                box: null,
                scan: "",
                search: "",
                dialogItem: {},
                page: 1,
                pageCount: 0,
                itemsPerPage: 1000,
                items: this.checkItem.collection === 'deliveries' ? [] : this.checkItem.transactionlines,
                record: this.checkItem.collection === 'transactions' ? this.checkItem : {
                    created: "new",
                    recordtype: "deliverycheck",
                    collection: "deliveries",
                    delivery: this.checkItem,
                    employee: this.$store.state.user.token == null ? "5e25613d170ef32114cc0528" : this.$store.state.user.token,
                    uniquelabels: [],
                    deliveryrecords: [],
                },
                headers: [
                    {
                        text: "Item",
                        align: "start",
                        sortable: false,
                        value: this.checkItem.collection === 'deliveries' ? "item" : "displayname",
                        dialog: true,
                        groupable: false,
                    },
                    {
                        text: "Scanned",
                        value: "quantity",
                        groupable: false,
                        sortable: false,
                    },
                    {
                        text: "Expected",
                        value: "quantitytopack",
                        groupable: false,
                        sortable: false,
                    },
                    { text: "Palette", value: "box" },
                    { text: "Bin", value: "bin", groupable: false },
                ],
            }
        },
        watch: {
            box(value) {
                this.search = value;
            },
        },
        mounted(){
            this.user = this.$store.getters.getUser;
        },
        async created() {
            if (this.checkItem.collection === 'deliveries') {
                this.loading = true;
                let data = this.record;
                this.record = await service("PUT", `deliveries`, { record: data })
                    .catch((err) => {
                        this.loading = false;
                        this.snackText = err.message;
                        this.snackbar = true;
                        throw err;
                    })
                    .then((res) => {
                        this.loading = false;
                        return res;
                    });
                    this.items = this.record["deliveryrecords"];
            }
        },
        methods: {
            closeDialog() {
                this.dialog = false;
            },
            closeDialogItem(index) {
                this.dialogItem[index] = false;
            },
            async saveRecord() {
                this.loading = true;
                if (this.checkItem.collection === 'deliveries') {
                    await service("POST", `deliveries`, this.record)
                        .catch((err) => {
                            this.loading = false;
                            this.snackText = err.message;
                            this.snackbar = true;
                            throw err;
                        })
                        .then((res) => {
                            this.loading = false;
                            this.snackText = 'Successfully saved record';
                            this.snackbar = true;
                            return res;
                        });
                    this.dialog = false;
                } else {
                    await service("PUT", `transactions/${this.record._id}`, this.record)
                        .catch((err) => {
                            this.loading = false;
                            this.snackText = err.message;
                            this.snackbar = true;
                            throw err;
                        })
                        .then((res) => {
                            this.loading = false;
                            this.snackText = "Successfully saved record";
                            this.snackbar = true;
                            return res;
                        });
                    this.dialog = false;
                }
            },
            async decodeBarcode(e) {
                if (e.keyCode === 13) {
                    let mode = "barcode";
                    let qty = parseInt(this.qty) || 1;
                    let item = null;
                    let delivery = this.record.delivery ? this.record.delivery.name : null;
                    let scanparts = this.scan.split(";");
                    let internaluniq = null;
                    let uniqLabel = null;
                    let scan = this.scan;
                    if (scanparts.length > 1) {
                        scan = scanparts[1];
                        internaluniq = scanparts[0];
                    }
                    let found = false;
                    let items =
                        this.checkItem.collection === "deliveries"
                            ? this.record["deliveryrecords"]
                            : this.record["transactionlines"];
                    for (let line of this.checkItem.collection === "deliveries"
                        ? this.record["deliveryrecords"]
                        : this.record["transactionlines"]) {
                        if (
                            scan ==
                            (mode == "name"
                                ? line.item.name
                                : line.barcode || line.item.barcode) &&
                            (this.record.box ? this.record.box == line.box : true)
                        ) {
                            found = true;
                            line.quantity = line.quantity ? line.quantity : 0;
                            let foundline = false;
                            let negative = false;
                            if (
                                this.record.recordtype == "inventorytransfer" &&
                                line.createdfromline.parentrecordtype != "inventorytransfer"
                            )
                                negative = true;
                            if (Math.abs(line.quantity) + 1 > Math.abs(line.quantitytopack)) {
                                for (let subline of items) {
                                    if (
                                        (mode == "name"
                                            ? subline.item.name
                                            : subline.barcode || subline.item.barcode) == scan &&
                                        (this.record.box ? this.record.box == subline.box : true) &&
                                        subline._id != line._id &&
                                        Math.abs(subline.quantity) < Math.abs(subline.quantitytopack)
                                    ) {
                                        line = subline;
                                    }
                                }
                            }
                            if (!foundline) {
                                if (negative) line.quantity = line.quantity - qty;
                                else line.quantity = line.quantity + qty;
                                if (this.record.recordtype == "itemfulfillment" && this.box) {
                                    if (line.box) {
                                        line.box = line.box.toString().split(",");
                                        if (!line.box.includes(this.box)) line.box.push(this.box);
                                    } else line.box = this.box;
                                    line.box = line.box.toString();
                                }
                            }
                            line.confirmed =
                                line.quantity == line.quantitytopack ? true : false;
                            if (
                                line.item &&
                                line.item.recordtype == "kititem" &&
                                this.record.recordtype == "itemfulfillment"
                            ) {
                                items.forEach((subline) => {
                                    if (subline.init == line._id) {
                                        subline.quantity = subline.componentquantity * line.quantity;
                                    }
                                });
                            }
                            if (line.init && this.record.recordtype == "itemfulfillment") {
                                let components = [];
                                let kitline = false;
                                items.forEach((subline) => {
                                    if (subline._id == line.init) kitline = subline;
                                    if (subline.init == line.init) {
                                        components.push(
                                            parseInt(subline.quantity || 0) / subline.componentquantity
                                        );
                                    }
                                });
                                kitline.quantity = Math.floor(Math.min(...components));
                                kitline.confirmed =
                                    kitline.quantity == kitline.quantitytopack ? true : false;
                            }

                            if (line.item && this.print && this.record.location) {
                                let bin = await this.getLocation(
                                    line.item._id,
                                    this.record.location._id
                                );
                                this.printLabel(line.item.name, scan, delivery, bin);
                            }
                            item = line.item;
                            break;
                        }
                    }
                    if (!found && this.record.recordtype == "itemfulfillment") {
                        uniqLabel = await this.checkVendorUniqLabels(scan);
                        if (uniqLabel && !internaluniq) {
                            this.record["uniquelabels"].push({
                                parameter: uniqLabel.parameter,
                                value: scan,
                            });
                        } else {
                            this.playSound(
                                "http://soundbible.com/mp3/Elevator Ding-SoundBible.com-685385892.mp3"
                            );
                        }
                    }
                    if (!found && this.record.recordtype == "deliverycheck") {
                        item = await this.checkItemByBarcode(scan);
                        let newline = await this.recalcRecord(
                            {
                                item: item,
                                quantity: qty,
                                box: this.record.box,
                                barcode: scan,
                                collection: "deliveries_items",
                            },
                            this.record
                        );
                        this.record["deliveryrecords"].push(newline);
                        if (item) {
                            if (this.print && this.record.location) {
                                let bin = await this.getLocation(
                                    item._id,
                                    this.record.location._id
                                );
                                this.printLabel(item.name, scan, delivery, bin);
                            }
                        } else {
                            this.playSound(
                                "http://soundbible.com/mp3/Elevator Ding-SoundBible.com-685385892.mp3"
                            );
                        }
                    }
                    if (!uniqLabel)
                        this.record["uniquelabels"].push({
                            parameter: item ? item.name || item : "Unrecognized Item",
                            value: internaluniq || scan,
                            confirmed: true,
                        });
                    this.scan = "";
                    this.qty = 1;
                }
            },
            async recalcRecord(record, parent) {
                return await service("PUT", record.collection, { record, parent })
                    .catch((error) => {
                        throw error;
                    })
                    .then((response) => {
                        return response;
                    });
            },
            async checkItemByBarcode(scan) {
                return await service("GET", `items/barcode/${scan}`)
                    .catch((error) => {
                        throw error;
                    })
                    .then((response) => {
                        return response;
                    });
            },
            async checkVendorUniqLabels(scan) {
                return await service("GET", `items/checklabels/${scan}`)
                    .catch((error) => {
                        throw error;
                    })
                    .then((response) => {
                        return response;
                    });
            },
            playSound(sound) {
                if (sound) {
                    var audio = new Audio(sound);
                    audio.play();
                }
            },
            async getLocation(item, location) {
                return await service("GET", `items_location/${item}/${location}`)
                    .catch((error) => {
                        throw error;
                    })
                    .then((response) => {
                        return response;
                    });
            },
            async printLabel(name, barcode, delivery, bin) {
                service("POST", `print/label`, {
                    type: "label",
                    name: name,
                    delivery: delivery,
                    barcode: barcode,
                    bin: bin,
                })
                    .catch((err) => {
                        this.loading = false;
                        this.snackText = err.message.message;
                        this.snackbar = true;
                        throw err;
                    })
                    .then((res) => {
                        this.loading = false;
                        this.snackText = "Successfully printed";
                        this.snackbar = true;
                        return res;
                    });
            },
            selectall() {
                for (let line of this.record["transactionlines"] ||
                    this.record["deliveryrecords"]) {
                    line.quantity = line.quantitytopack;
                    line.confirmed = true;
                }
            },
            filter(value, search, item) {
                if (this.box) {
                    if (item.box == this.box) return true;
                    else return false;
                } else return this.filter(value, search, item);
            },
        },
        components: { ItemDetails }
    }
</script>
<style scoped>
    .v-app-bar.v-app-bar--fixed {
        top: unset;
    }
</style>