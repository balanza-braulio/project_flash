var jqueryNoConflict = jQuery;

//begin main function
// jqueryNoConflict(document).ready(function () {
    // This is the function to inject a handlebars template through ajax, all you
    // need is the template path, the css selecter you want to inject the template into
    // and the route you want to retrieve your data from
    // example = retriveData("/templates/test.handlebars", "#test", '/getUsers');
// });

// Grab data
function retriveData(template, selector, source) {

    try {
        // TO DO: Implement function to retrieve from the database
        $.ajax({
            dataType: "json",
            url: source,
            success: objects => {
                var objects = {objects};
                renderData(template, selector, objects);
            },
        });;
    }
    catch (e) {
        console.log(e)
    }
};

// Render handlebars templates via ajax
function getTemplateAjax(path, callback) {
    var source, template;
    jqueryNoConflict.ajax({
        url: path,
        success: function (data) {
            source = data;
            template = Handlebars.compile(source);
            if (callback) callback(template);
        }
    });
};

// Function to compile handlebars template
function renderHandlebarsTemplate(withTemplate, inElement, withData) {
    getTemplateAjax(withTemplate, function (template) {
        jqueryNoConflict(inElement).html(template(withData));
    })
};

// Render compiled handlebars template
function renderData(template, selector, data) {
    handlebarsDebugHelper();
    renderHandlebarsTemplate(template, selector, data);
};

// add handlebars debugger
function handlebarsDebugHelper() {
    Handlebars.registerHelper("debug", function (optionalValue) {
        console.log("Current Context");
        console.log("====================");
        console.log(this);
    });
};