/* Filters */

app
.filter('mapDisclaimerFromPageTitle', function() {
  return function(title) {
    return "This map represents the allocation of budget money within " + title + " per county council district, note that some projects can be part of multiple districts so the total amount of money can seem to exceed the total actual amount as the allocation is represented for both districts.";

  };
})
.filter('currencyMaxLength', function(numberFormatter) {
  return function(value, length) {
    return numberFormatter.formatNumber(value, {currency: '$', maxLength: length});
  };
})
.filter('ellipsis', function () {
  return function (text, maxChars) {
    if (text.length > maxChars) {
      return text.substring(0, maxChars - 3) + '...';
    } else {
      return text;
    }
  };
})
.filter('lastWords', function() {
  return function(text, num) {
    return _.last(text.split(" "), num).join(" ");
  }
})
.filter('totalsCurrency', ['numberFormatter', function(numberFormatter) {
  return function(amount, component) {
    var negative = amount < 0;
    var magnitude = Math.abs(amount);
    var formattedCurrency = numberFormatter.formatNumber(magnitude, {
      currency: '$',
      maxLength: (magnitude < 1000000) ? 8 : 4, // fully render numbers under 1M
      fullTextMultiplier: true
    });
    var valueAndUnit = formattedCurrency.split(" ");
    var value = valueAndUnit.shift();
    switch (component) {
      case 'value':
        return negative ? '-' + value : value;
      case 'unit':
        return valueAndUnit.length > 0 ? valueAndUnit.shift() : '';
    }
  }
}])
.filter('numberMaxLength', ['numberFormatter', function(numberFormatter) {
  return function(amount, length) {
    return numberFormatter.formatNumber(amount, { maxLength: length });
  }
}])
.filter('uriEncode', function(numberFormatter) {
  return function(value) {
    return encodeURIComponent(value);
  }
});
