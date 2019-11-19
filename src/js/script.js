/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      console.log('new Product', thisProduct);

      thisProduct.getElements();

      thisProduct.initAccordion();

      thisProduct.initOrderForm();

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
    }

    initAccordion(){
      const thisProduct = this;

      // find the clickable trigger (element that should react to clicks)

      // START: click event listener to trigger
      thisProduct.accordionTrigger.addEventListener('click', function(){
        console.log('click!');

        // prevent default action on event
        event.preventDefault();
        
        // toggle active class on element of thisProduct
        thisProduct.element.classList.toggle('active');

        // find all active products
        const activeProducts = document.querySelectorAll('.product.active');
        console.log(activeProducts);
        
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
      console.log('Init Order Form start');

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
      });
    }

    processOrder() {
      const thisProduct = this;
      console.log('Process Order start');

      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('form data', formData);

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
            console.log('dodaje koszty', price);

          /* END IF: if option is selected and option is not default */
          } 

          /* START ELSE IF: if option is not selected and option is default */
          else if(!optionSelected && option.default) {

            /* deduct price of option from price */
            price -= option.price;
            console.log('odejmuje cene', price);

            /* START adding active class to selected picture items */
            const productPictures = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId); // znajduję obrazki
            console.log('tu sa obrazki', productPictures);
            
            for(let index of productPictures) {
              console.log(typeof productPictures);
              if(optionSelected) {
                productPictures[index].classList.add('active');
              } else {
                productPictures[index].classList.remove('active');
              }
            }

          /* END ELSE IF: if option is not selected and option is default */
          }
          
          
        /* END LOOP: for each optionId in param.options */
        }

      /* END LOOP: for each paramId in thisProduct.data.params */
      }
        
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      console.log(thisProduct.priceElem);
      thisProduct.priceElem.innerHTML = price;
    }
  }


  
  const app = {
    initMenu: function(){
      const thisApp = this;

      console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };
  
  app.init();
}
