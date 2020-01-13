/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
import {BaseWidget} from './BaseWidget.js';
import {utils} from '../utils.js';
import {select, settings} from '../settings.js';

export class HourPicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, settings.hours.open);
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);

    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input;
  }

  initPlugin(){
    const thisWidget = this;
    rangeSlider.create(thisWidget.dom.input);

    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input;
    });
  }

  parseValue(newValue){
    utils.numberToHour(newValue);
    console.log(newValue);
  }

  isValid(){
    return true;
  }

  renderValue(){
    const thisWidget = this;
    thisWidget.dom.output.innerHTML = thisWidget.value;
  }
}