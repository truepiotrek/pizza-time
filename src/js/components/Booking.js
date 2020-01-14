/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
import {templates, select, settings} from '../settings.js';
import { AmountWidget } from './AmountWidget.js';
import { DatePicker } from './DatePicker.js';
import { HourPicker } from './HourPicker.js';
import { utils } from '../utils.js';

export class Booking {
  constructor(reservWidgetContainer){
    const thisBooking = this;


    thisBooking.render(reservWidgetContainer);
    thisBooking.initWidgets();
    thisBooking.getData();

  }

  render(bookingContainer){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    
    thisBooking.dom = {};
    thisBooking.dom.wrapper = bookingContainer;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
  }

  getData(){
    const thisBooking = this;
  
    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);
  
    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];
  
    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };
  
    // console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };
    
    // console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let booking of bookings){
      thisBooking.makeBooked(booking.date, booking.hour, booking.duration, booking.table);
    }
    
    for(let event of eventsCurrent){
      thisBooking.makeBooked(event.date, event.hour, event.duration, event.table);
    }

  const minDate = thisBooking.datePicker.minDate;
  const maxDate = thisBooking.datePicker.maxDate;

    for(let event of eventsRepeat){
      if(event.repeat === 'daily'){
        console.log('tak, jest event daily');
        for(let i = minDate; i <= maxDate; i = utils.addDays(i, 1)){
          thisBooking.makeBooked(utils.dateToStr(i), event.hour, event.duration, event.table);
        }
      }
    }
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    console.log('booked dates', thisBooking.booked);

    if(typeof thisBooking.booked[date] === 'undefined'){
      thisBooking.booked[date] = {};
    } 
    const startingHour = utils.hourToNumber(hour);

    for(let hourBlock = startingHour; hourBlock <= startingHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hourBlock] === 'undefined'){
        thisBooking.booked[date][hourBlock] = [table];
      } else {
        thisBooking.booked[date][hourBlock].push(table);
      }
    }
  }
  
  
  
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
}
