/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
import {BaseWidget} from './BaseWidget.js';
import {utils} from '../utils.js';
import {select, settings} from '../settings.js';

export class DatePicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();

    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      'locale': {
        'firstDayOfWeek': 1,
      },
      'disable': [
        function(date){
          return (date.getDay() === 0 || date.getDay() === 6);
        }
      ]
    });
  }

  initPlugin(){
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = new Date(utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture));
  }

  parseValue(newValue){
  return newValue;
  }

  isValid(){
    return true;
  }

  renderValue(){
    console.log('datePicker');
  }
}
