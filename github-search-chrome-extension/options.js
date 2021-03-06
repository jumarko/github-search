$(document).ready(function () {
    var DEFAULT_ORGANIZATION_NAME = "gooddata";

    function loadOptions() {

        // set default organization if no other is set
        if (!localStorage['organization-name']) {
            localStorage['organization-name'] = DEFAULT_ORGANIZATION_NAME;
        }

        var organizationNameField = $("#organization-name");
        organizationNameField.attr('value', localStorage['organization-name']);
    }

    function saveOptions(organization) {
        localStorage['organization-name'] = organization;
    }

    function getOrganizationName() {
        return $.trim($("#organization-name").val());
    }

    var flash = $('.flash');
    flash.hide();
    loadOptions();
    $("form#options").submit(function () {
        var organization = getOrganizationName();
        if (organization) {
            saveOptions(organization);
            flash.html('<i>Organization name "' + organization + '" has been saved.</i>');
            flash.show();
        } else {
            flash.html("<strong>Organization name cannot be empty!</strong>")
        }

        return false;
    });
    a
});
