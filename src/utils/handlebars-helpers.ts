const moment = require('moment')
export const register = function (Handlebars) {
    var helpers = {
        formatCurrency: function (currency) {
            return currency.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        },
        formatDate: function (date, format) {
            return moment(date).format(format);
        },
    
    };

    if (Handlebars && typeof Handlebars.registerHelper === "function") {
        for (var prop in helpers) {
            Handlebars.registerHelper(prop, helpers[prop]);
        }
    } else {
        return helpers;
    }

};
