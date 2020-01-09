/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
import {app} from '../app.js';
import {utils} from '../utils.js';
import {settings, templates} from '../settings.js';

export class Booking {
  constructor(){
    const thisBooking = this;

    thisBooking.render(app.initBooking);
    thisBooking.initWidgets();

  }

  render(){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    
    thisBooking.dom = {};
    thisBooking.dom.wrapper = generatedHTML;
    
    // console.log(thisBooking.dom.wrapper);
    
  }
  
  initWidgets(){
    const thisBooking = this;

  }
}
