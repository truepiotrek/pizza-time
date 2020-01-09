/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars


export class BaseWidget {

  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;
  }

  get value(){
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(assignedValue){
    const thisWidget = this;

    const newValue = thisWidget.parseValue(assignedValue);

    if(newValue != thisWidget.correctValue && thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
      thisWidget.announce();

    }
    thisWidget.renderValue();
  }
}