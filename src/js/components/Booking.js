/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

import {templates, select, settings, classNames} from '../settings.js';
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
    thisBooking.initTableHandlers();
    thisBooking.submitBooking();
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
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.bookTable = thisBooking.dom.wrapper.querySelector(select.booking.bookTable);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
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
        //console.log('tak, jest event daily');
        for(let i = minDate; i <= maxDate; i = utils.addDays(i, 1)){
          thisBooking.makeBooked(utils.dateToStr(i), event.hour, event.duration, event.table);
        }
      }
    }
    thisBooking.updateDOM();
  }

  getBookingData(){
    const thisBooking = this;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      duration: thisBooking.hoursAmount.value,
      peopleAmount: thisBooking.peopleAmount.value,
      bookingAddress: thisBooking.dom.address.value,
      bookingPhone: thisBooking.dom.phone.value,
      table: [],
      starters: [],
    };

    for(let starter of thisBooking.dom.starters){
      console.log(starter);
      if(starter.checked === true){
        payload.starters.push(starter.value);
      }
    }

    for(let table of thisBooking.dom.tables){
      if(table.classList.contains(classNames.booking.bookedByUser)){
        let tableId = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
        payload.table.push(tableId);
      }
    }
    

    return payload;
  }

  submitBooking(){
    const thisBooking = this;
    //console.log('preventuje raz');
    const url = settings.db.url + '/' + settings.db.booking;

    thisBooking.dom.bookTable.addEventListener('click', function(event){
      event.preventDefault();
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(thisBooking.getBookingData()),
      };
  
      fetch(url, options)
        .then(function(response){
          return response.json();
        }).then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);
          for(let table of parsedResponse.table){
            thisBooking.makeBooked(parsedResponse.date, parsedResponse.hour, parsedResponse.duration, table);
          }
        });
    });
  }

  makeBooked(date, hour, duration, table){

    const thisBooking = this;

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
  
  updateDOM(){
    const thisBooking = this;
    

    thisBooking.date =  thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    //console.log(thisBooking.date);

    for(let table of thisBooking.dom.tables){
      let tableId = parseInt(table.getAttribute(settings.booking.tableIdAttribute));

      if(typeof thisBooking.booked[thisBooking.date] !== 'undefined' && 
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] !== 'undefined' &&
      thisBooking.booked[thisBooking.date][thisBooking.hour].indexOf(tableId) !== -1){
        table.classList.add(classNames.booking.tableBooked);
        //console.log('dodalem');
      } else {
        table.classList.remove(classNames.booking.tableBooked, classNames.booking.bookedByUser);
        //console.log('zabralem');
      }
    }
  }

  initTableHandlers(){
    const thisBooking = this;

    for(let table of thisBooking.dom.tables){
      table.addEventListener('click', function(){
        table.classList.add(classNames.booking.tableBooked, 'selectedByUser');
        let tableId = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
        console.log('zabukowalem stolik nr: ', tableId, table);
      });
      
    }
  }
  
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });    
  }
}
