/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Product{
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

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
}
