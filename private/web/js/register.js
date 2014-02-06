var $ = require("./lib/jquery"),
    Q = require("./lib/q.min"),
    tools = require("./models/tools"),
    services = require("./models/services");

require("./lib/bootstrap");

$(function () {
    _data = JSON.parse($(".data").html()); 

    $("button[type='submit']").click(onRegisterClick);

    $("input").blur(function () {
        $(this).popover("destroy");
    });

    var firstEmptyInput = $("input").filter(function () { return !$(this).val(); })[0];
    $(firstEmptyInput).focus();
});

function onRegisterClick(event) {
    event.preventDefault();

    var data = validate();
    if (!data) return;

    services.register(data)
        .done(function () {

            $("form :input").attr({ disabled: true });
            $(".alert-success").show();

        }, tools.reportError)
}

function validate() {
    var authToken = $("input[name='authToken']").val();
    var email, password, repeatPassword, firstName, lastName, registrationCode;

    if (!(email = validateField("email", "Email missing")))
        return false;

    if (!authToken) {
        if (!(password = validateField("password", "Password missing")))
            return false;

        if (!(repeatPassword = validateField("repeat-password", "Password missing")))
            return false;

        if (password !== repeatPassword) {
            $("input[name='password']").focus()
                .popover({ content: "Password mismatch", placement: "bottom" })
                .popover("show");
            return false;
        }
    }

    if (!(firstName = validateField("firstName", "First name missing")))
        return false;

    if (!(lastName = validateField("lastName", "Last name missing")))
        return false;

    if (_data.codeRequired && !(registrationCode = validateField("registrationCode", "Registration code missing")))
        return false;

    return {
        email: email,
        password: password,
        authToken: authToken,
        firstName: firstName,
        lastName: lastName,
        registrationCode: registrationCode
    };
}

function validateField(name, message) {
    var $field = $("input[name='" + name + "']");
    if (!$field.val()) {
        $field.focus()
            .popover({ content: message, placement: "bottom" })
            .popover("show");
        return false;
    }
    return $field.val();
}
