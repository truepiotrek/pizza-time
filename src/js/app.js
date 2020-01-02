import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {select, settings, classNames, templates} from './settings.js';

const app = {
  initMenu: function(){
    const thisApp = this;

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
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
      console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initPages: function(){
    const thisApp = this;

    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);

    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));

    thisApp.activatePage(thisApp.pages[0].id);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        // get page id from href
        let pageID = clickedElement.getAttribute('href');
        pageID = pageID.replace('#', '');
        
        //activate page
        thisApp.activatePage(pageID);
      });
    }
  },

  activatePage(pageId){
    const thisApp = this;

    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') === '#' + pageId);
    }

    for(let page of thisApp.pages){
      page.classList.toggle(classNames.nav.active, page.getAttribute('href') === pageId);
    }
  },

  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();   
    thisApp.initCart();
  },
};

app.init();