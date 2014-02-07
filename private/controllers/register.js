exports.render = function (req, res) {

    // if available, pre-fill some fields from the provider
    var provider, authToken, email, firstName, lastName;

    var registrationInfo = req.session.registrationInfo;
    if (registrationInfo) {
        if (registrationInfo.google) {
            var profile = registrationInfo.google.profile;
            provider = "google";
            authToken = registrationInfo.google.identifier;
            email = profile.emails && profile.emails[0] && profile.emails[0].value;

            if (profile.name) {
                var name = profile.name;
                firstName = name.givenName;
                lastName = name.middleName ? name.middleName + " " + (name.familyName || "") : name.familyName;
            }
        }

        delete req.session.registrationInfo;
    }

    res.render("register", {
        provider: provider,
        data: {
            email: email || "",
            firstName: firstName || "",
            lastName: lastName || "",
            authToken: authToken,
            codeRequired: !!process.env.APP_REGISTRATION_CODE,
        }
    });
};