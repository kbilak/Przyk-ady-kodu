export const useCartStore = defineStore('CartStore', {
  state: () => {
    return {
      count: 0,
      items: [],
    };
  },
  getters: {},
  actions: {
    addItem(item) {
      let existingItem = this.items.filter(i => i.item.id == item.item.id)
      if (existingItem.length > 0) {
        const itemsArray = JSON.parse(JSON.stringify(this.items));
        let index = itemsArray.findIndex(i => i.item.id === JSON.parse(JSON.stringify(existingItem))[0].item.id);
        let singlePrice = this.items[index].totalPrice / this.items[index].ammount;
        this.items[index].ammount = parseInt(this.items[index].ammount) + 1
        this.items[index].totalPrice = (parseInt(this.items[index].totalPrice) + parseInt(singlePrice)).toFixed(2)
      } else {
        this.items.push(item);
      }
    },
    removeItem(item) {
      let itemToRemove = item
      const filteredArray = this.items.filter(function(element) {
        return element !== itemToRemove
      })
      this.items = filteredArray;
    },
    countItems() {
      return this.items.length
    },
    getFullPrice() {
      let price = 0;
      for (let i = 0; i < this.items.length; i++) {
        price = price + parseInt(this.items[i].totalPrice)
      }
      return parseInt(price).toFixed(2)
    },
    updateItem(item, symbol) {
      let searchItem = item
      let index = this.items.indexOf(searchItem)
      if (symbol === 'plus') {
        let singlePrice = this.items[index].totalPrice / this.items[index].ammount;
        this.items[index].ammount = parseInt(this.items[index].ammount) + 1
        this.items[index].totalPrice = (parseInt(this.items[index].totalPrice) + parseInt(singlePrice)).toFixed(2)
      } else {
        let singlePrice = this.items[index].totalPrice / this.items[index].ammount;
        this.items[index].ammount = parseInt(this.items[index].ammount) - 1
        this.items[index].totalPrice = (parseInt(this.items[index].totalPrice) - parseInt(singlePrice)).toFixed(2)
      }
    }
  },
});


if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
}
