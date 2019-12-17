/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // code added
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },

    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
    
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.name = data.name;

      thisProduct.renderInMenu();
      // console.log('new Product', thisProduct);

      thisProduct.getElements();

      thisProduct.initAccordion();

      thisProduct.initOrderForm();

      thisProduct.initAmountWidget();

      thisProduct.processOrder();
    }

    renderInMenu() {
      const thisProduct = this;
      // generate hmtl based on template
      const generatedHTML = templates.menuProduct(thisProduct.data);
      // create element using utils.createElementFromHTML
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      // find menu container
      const menuContainer = document.querySelector(select.containerOf.menu);
      // add element to menu
      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;

      // find the clickable trigger (element that should react to clicks)

      // START: click event listener to trigger
      thisProduct.accordionTrigger.addEventListener('click', function(){
        // console.log('click!');

        // prevent default action on event
        event.preventDefault();
        
        // toggle active class on element of thisProduct
        thisProduct.element.classList.toggle('active');

        // find all active products
        const activeProducts = document.querySelectorAll('.product.active');
        // console.log(activeProducts);
        
          // START LOOP: for each active product
        for(let activeProduct of activeProducts){

          // START:  if the active product isn't the element of thisProduct
          if(activeProduct !== thisProduct.element){

            // remove class active for the active product
            activeProduct.classList.remove('active');
            
          // END: if the active product isn't the element of thisProduct
          }

        // END LOOP: for each active product
        }

      // END click event listener to trigger
    });
    }

    initOrderForm() {
      const thisProduct = this;
      // console.log('Init Order Form start');

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs) {
        input.addEventListener('change', function() {
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;

      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);
      // console.log('form data', formData);

      thisProduct.params = {};

      /* set variable price to equal thisProduct.data.price */
      let price = thisProduct.data.price;

      /* START LOOP: for each paramId in thisProduct.data.params */
      for(let paramId in thisProduct.data.params) {

        /* save the element in thisProduct.data.params with key paramId as const param */
        const param = thisProduct.data.params[paramId];

        /* START LOOP: for each optionId in param.options */
        for(let optionId in param.options) {

          /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];
          
          /* START IF: if option is selected and option is not default */
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          if(optionSelected && !option.default) {

            /* add price of option to variable price */
            price += option.price;

          /* END IF: if option is selected and option is not default */
          } 

          /* START ELSE IF: if option is not selected and option is default */
          else if(!optionSelected && option.default) {

            /* deduct price of option from price */
            price -= option.price;
            
          /* END ELSE IF: if option is not selected and option is default */
          }

          /* START adding active class to selected picture items */
          const productPictures = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId); // znajduję obrazki
          
          if(optionSelected) {
            if(!thisProduct.params[paramId]){
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;
            for(let productPicture of productPictures) {
              productPicture.classList.add(classNames.menuProduct.imageVisible);
            }
          } else {
            for(let productPicture of productPictures) {
              productPicture.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        /* END LOOP: for each optionId in param.options */
        }
      /* END LOOP: for each paramId in thisProduct.data.params */
      }
      
      // multiply price by amount
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;

      // console.log('thisProduct.params', thisProduct.params);
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function(event){
        thisProduct.processOrder();
        console.log(event);
      });
    }

    addToCart(){
      const thisProduct = this;

      // thisProduct.data.name = thisProduct.name;
      thisProduct.name = thisProduct.data.name;
      // thisProduct.amountWidget.value = thisProduct.amount; // jezeli zmienie na amountWidgetElem to mozna zmniejszac ilosc po dodaniu ale wciaz nie dziala poprawnie
      thisProduct.amount = thisProduct.amountWidget.value;

      app.cart.add(thisProduct);
    }
  }

  class AmountWidget {

    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);

      thisWidget.value = settings.amountWidget.defaultValue;

      thisWidget.setValue(thisWidget.input.value);

      thisWidget.initActions();

      // console.log('AmountWidget:', thisWidget);
      // console.log('constructor arguments:', element);
    }

    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;

      let newValue = parseInt(value);

      // TODO: Add validation
      if(newValue !== thisWidget.value && newValue <= settings.amountWidget.defaultMax && newValue >= settings.amountWidget.defaultMin) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }



      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;

        thisWidget.input.addEventListener('change', function() {
          thisWidget.setValue(thisWidget.input.value);
        });

      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });

    }

    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];
      thisCart.deliveryFee = 0;
      console.log(thisCart.deliveryFee);
      

      thisCart.getElements(element);
      thisCart.initActions(element);

      // console.log('new cart', thisCart);
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

      thisCart.dom.form = element.querySelector(select.cart.form);

      for(let key of thisCart.renderTotalsKeys){
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }
      
    }

    sendOrder(){
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.order;

      const payload = {
        address: 'test',
        totalPrice: thisCart.totalPrice,
      };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    }


    
    add(menuProduct){
    // console.log('adding product', menuProduct);

      const thisCart = this;

      // generate hmtl based on template
      const generatedHTML = templates.cartProduct(menuProduct);
      
      // create element using utils.createElementFromHTML
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      
      // add element to cart
      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      // console.log('thisCart.products', thisCart.products);

      thisCart.update();
    }

    update(){
      const thisCart = this;

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for(let product of thisCart.products){
        thisCart.subtotalPrice += product.price;
        thisCart.totalNumber += product.amount;
      }

      if(thisCart.totalNumber == 0){ 
        thisCart.deliveryFee = 0;
      } else {
        thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      }
      


      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      console.log(thisCart.totalNumber, thisCart.subtotalPrice, thisCart.totalPrice);


      
      for(let key of thisCart.renderTotalsKeys){
        for(let elem of thisCart.dom[key]){
          elem.innerHTML = thisCart[key];
        }
      }
    }

    remove(cartProduct){
      const thisCart = this;

      const index = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(index, 1);
      cartProduct.dom.wrapper.remove();
      thisCart.update();
    }


  }
  
  class CartProduct{
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      // console.log('new CartProduct', thisCartProduct);
      // console.log('productData', menuProduct);
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amountWidget.value; 
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        
        // console.log('tu jest cena', thisCartProduct.dom.price);
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
  }
  
  const app = {
    initMenu: function(){
      const thisApp = this;

      // console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;
      

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.product;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);

          // save parsedResponse at thisAp.data.products
          thisApp.data.products = parsedResponse;

          // execute initMenu method
          thisApp.initMenu();
        });

        console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      
      thisApp.initCart();
    },
  };
  
  app.init();
}
