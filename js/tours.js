'use strict';

(function ($) {
  const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const URL = './source.php';

  $(document).ready(init);

  // init function
  function init() {
    initDataLoad();
  }

  // returns clone of prototype object
  function getPrototype() {
    var prototype = $('#rides-list-prototype').clone();
    prototype.removeClass('d-none');
    prototype.removeAttr('id');
    prototype.find('.list-group-item').remove();
    return prototype
  }

  // returns an item of the prototype object
  function getPrototypeItem() {
    var item = $('#rides-list-prototype .list-group-item').clone();
    return item
  }

  // returns the list where rides should be added
  function getRidesList() {
    return $('.list-rides');
  }

  // load Data function
  function initDataLoad() {
    var jqxhr = $.getJSON(URL)
    .done(handleResponse)
    .fail(function(err) {
      console.log( "Error on data loading", err );
    });
  }

  // create Datetime from timestamp
  function createDatetimeFromTimestamp(timestamp) {
    var datetime = new Date(0);
    datetime.setUTCSeconds(timestamp);
    return datetime;
  }

  // handle Response function
  function handleResponse(response) {
    var travels = response;
    var sortedByMonths = {};

    travels.forEach(function (item) {
      var date = createDatetimeFromTimestamp(item.startTime.timestamp);
      console.log(date);
      item.startTime = date;
      if (!(date.getMonth() in sortedByMonths)) {
        sortedByMonths[date.getMonth()] = [];
      }
      sortedByMonths[date.getMonth()].push(item);
    });

    displayRides(sortedByMonths);
  }

  // display rides in UI
  function displayRides(ridesSortedbyMonth) {
    var keys = Object.keys(ridesSortedbyMonth);
    keys.sort();
    keys.reverse();

    keys.forEach(function (index) {
      var rides = ridesSortedbyMonth[index];
      displayMonthlyRides(rides, index);
    });
  }

  // display monthly rides
  function displayMonthlyRides(rides, month) {
    var prototype = getPrototype();
    prototype.find('.js-agg-month').text(MONTHS[month]);
    prototype.find('.js-agg-price').text(roundToDecimals((getSumPrice(rides) / 100), 2).toString().replace('.', ','));

    getRidesList().append(prototype);

    rides.sort((a, b) => {a.startTime.getTime() - b.startTime.getTime()});
    console.log(rides);
    rides.forEach((ride) => {addRidesToPrototype(ride, prototype);});
  }

  // renders a ride and adds it to the row
  function addRidesToPrototype(ride, row) {
    row.append(renderRide(ride));
  }

  // renders a ride
  function renderRide(ride) {
    if (ride.endTime.timestamp) {
      ride.endTime = createDatetimeFromTimestamp(ride.endTime.timestamp);
    }
    var ui = getPrototypeItem();

    // confiure line
    var line = ui.find('.js-line');
    line.text(ride.line);
    line.css('background-color', ride.lineColor);

    // configure date
    ui.find('.js-date').text(ride.startTime.getDate() + '.' + (ride.startTime.getMonth() + 1) + '.');

    // configure Start
    ui.find('.js-starttime').text(ride.startTime.getHours() + ':' + ride.startTime.getMinutes());
    ui.find('.js-startstation').text(ride.startStation);

    // configure End
    if(ride.endTime && ride.endStation) {
      ui.find('.js-endtime').text(ride.endTime.getHours() + ':' + ride.endTime.getMinutes());
      ui.find('.js-endstation').text(ride.endStation);
    }

    // configure duration
    if (ride.endTime) {
      ui.find('.js-length').text(roundToDecimals((ride.endTime.getTime() - ride.startTime.getTime()) / 60000));
    }

    // configure price
    if (ride.price) {
      ui.find('.js-rideprice').text((ride.price / 100).toString().replace('.', ','));
    }

    // display the correct right cell, according to a set end
    if (!ride.endTime) {
      ui.find('.js-with-end').remove();
      ui.find('.js-without-end').removeClass('d-none');
    }

    return ui;
  }

  // returns the sum of the prices of the rides
  function getSumPrice(rides) {
    var price = 0;
    rides.forEach(function (ride) {
      price += convert2Float(ride.price);
    });
    return price;
  }

  // returns a number if parsing had been successfull, otherwise zero
  function convert2Float(string) {
    if (string && NaN != parseFloat(string)) {
      return parseFloat(string);
    } else {
      return 0;
    }
  }

  // round to n decimals
  function roundToDecimals(number, decimals = 0) {
    var dividor = Math.pow(10, decimals);
    number *= dividor;
    number = Math.round(number);
    return number / dividor;
  }
}(jQuery));
