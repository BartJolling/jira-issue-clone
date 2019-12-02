// ==UserScript==
// @name        JIRA Issue - Clone
// @author      Bart Jolling.
// @description Adds a client-side clone button to the Operations toolbar for JIRA issues.
// @namespace   http://bartjolling.github.io
// @version     2.2.1
// @include     /^https://jira\..+?//
// @require     https://raw.githubusercontent.com/BartJolling/inject-some/master/inject-some.js
// @downloadURL https://raw.githubusercontent.com/BartJolling/jira-issue-clone/master/jira-issue-clone.user.js
// @grant       none
// @run-at      document-end
// ==/UserScript==

/**
 * Script to be injected directly into the page
 */
var scriptToInject = function ($) {
    var BROWSE_URL = window.location.protocol + '//' + window.location.hostname + '/browse/';
    var API_URL = window.location.protocol + '//' + window.location.hostname + '/rest/api/latest/issue/';

    // User-Agent must be blank to avoid JIRA issue with cross origin checks for Firefox.
    $.ajaxSetup({
        beforeSend: function (request) {
            request.setRequestHeader("User-Agent", "");
        }
    });

    /**
     * Adds a 'Clone' button to the operations toolbar in JIRA
     * @param {string} issueIdorKey - id (e.g. 12345) or key (e.g. PRJ-123) of the issue  or to retrieve
     */
    function addCloneButton(issueIdorKey) {

        if (typeof issueIdorKey === "undefined") {
            console.log('[jira-issue-clone][addCloneButton] Issue id or key required but undefined');
            return;
        }

        try {
            // abort if Clone button was already added before.
            var $clone = $('#jira-issue-clone');

            if ($clone.length > 0) {
                return;
            }

            // toolbar2 -- new style of toolbars in Jira
            var $opsbar = $("div#opsbar-opsbar-operations");

            if (1 === $opsbar.length) {
                addCloneButtonToolbarDiv(issueIdorKey, $opsbar);
                return;
            }

            // toolbar -- deprecated style of toolbars in Jira version 7.8 and below
            $opsbar = $("ul#opsbar-opsbar-operations");

            if (1 === $opsbar.length) {
                addCloneButtonToolbarUl(issueIdorKey, $opsbar);
                return;
            }

            console.log('[jira-issue-clone][addCloneButton] Could not find toolbar to the Clone button to.');
        }
        catch (err) {
            console.log('[jira-issue-clone][addCloneButton] ' + err.message);
        }
    };

    /**
     * Adds a 'Clone' button to the operations toolbar in JIRA - using UL
     * @param {string} issueIdorKey - id (e.g. 12345) or key (e.g. PRJ-123) of the issue  or to retrieve
     * @param {Object} $opsbar - jQuery object representing the operations toolbar (<= v7.8)
     */
    function addCloneButtonToolbarUl(issueIdorKey, $opsbar) {
        var showProgress = function () { $('.button-spinner').spin(); };
        var hideProgress = function () { $('.button-spinner').spinStop(); };

        var $clone = $('<a>').addClass('toolbar-trigger').attr('id', 'jira-issue-clone')
            .click(function () { cloneIssue(issueIdorKey, showProgress, hideProgress); }).append(
                $('<span>').addClass('trigger-label').append("Clone"));

        var $spinner = $('<div>').addClass('button-spinner').css({ position: 'relative', top: '15px' });

        $opsbar.append($('<li>').addClass('toolbar-item').append($clone));
        $opsbar.append($('<li>').addClass('toolbar-item').append($spinner));
    }

    /**
     * Adds a 'Clone' button to the operations toolbar in JIRA - using DIV
     * @param {string} issueIdorKey - id (e.g. 12345) or key (e.g. PRJ-123) of the issue  or to retrieve
     * @param {Object} $opsbar - jQuery object representing the operations toolbar ( > v7.8)
     */
    function addCloneButtonToolbarDiv(issueIdorKey, $opsbar) {
        var showProgress = function () { $('#jira-issue-clone')[0].busy(); };
        var hideProgress = function () { $('#jira-issue-clone')[0].idle(); };

        var $clone = $('<a>').addClass('aui-button').addClass('toolbar-trigger')
            .attr('id', 'jira-issue-clone').attr('title', 'Clone this issue')
            .click(function () { cloneIssue(issueIdorKey, showProgress, hideProgress); })
            .append($('<span>').addClass('trigger-label').append("Clone"));

        $opsbar.append($clone);
    }

    /**
    * Main function that is executed when user clicks the clone button.
    * Drives the process of retrieving info, building a new issue and submitting it.
    * @param {string} issueIdorKey - id (e.g. 12345) or key (e.g. PRJ-123) of the issue  or to retrieve
    * @param {function} showProgress - callback to start showing progress on the UI
    * @param {function} hideProgress - callback to stop showing progress on the UI
    */
    function cloneIssue(issueIdorKey, showProgress, hideProgress) {
        try {
            showProgress();

            getCurrentIssueFields(issueIdorKey)
                .then(function (issue) {
                    var currentFields = issue.fields;
                    var projectId = currentFields.project.id;
                    var issueTypeId = currentFields.issuetype.id;

                    getIssueTypeFields(projectId, issueTypeId)
                        .then(function (meta) {

                            if (meta.projects[0]) {
                                var issueTypeFields = meta.projects[0].issuetypes[0].fields;
                                createNewIssue(currentFields, issueTypeFields, hideProgress);
                            } else {
                                hideProgress();
                                var msg = 'Cannot fetch meta data for project ' + currentFields.project.key + ' and type ' + currentFields.issuetype.name;
                                alert(msg);
                            }
                        })
                        .fail(handleAjaxError)
                        .fail(function () {
                            hideProgress();
                        });
                })
                .fail(handleAjaxError)
                .fail(function () {
                    hideProgress();
                });
        }
        catch (err) {
            console.log('[jira-issue-clone][cloneIssue] ' + err.message);
            hideProgress();
            alert(err.message);
        }
    };

    /**
    * Returns a promise to load the data of the current issue.
    * @param {string} issueId - id of the issue to retrieve
    */
    function getCurrentIssueFields(issueId) {
        try {
            var query = API_URL + issueId;
            return $.getJSON(query);
        }
        catch (err) {
            alert(err.message);
            throw (err);
        }
    };

    /**
    * Returns a promise to load the fields on the create screen for a certain project and issue type.
    * @param {string} projectId - id of the project to find the Create screen.
    * @param {string} issueTypeId - id of the issue type to find the Create screen
    */
    function getIssueTypeFields(projectId, issueTypeId) {
        try {
            var query = API_URL + "createmeta?projectIds=" + projectId + "&issuetypeIds=" + issueTypeId + "&expand=projects.issuetypes.fields";
            return $.getJSON(query);
        }
        catch (err) {
            alert(err.message);
            throw (err);
        }
    };

    /**
    * Builds a new issue using information of the current issue, filtered down with the fields on the create screen.
    * @param {string} currentFields - list of fields of the current issue.
    * @param {string} issueTypeFields - list of fields on the Create screen for this issue type
    */
    function createNewIssue(currentFields, issueTypeFields, hideProgress) {

        try {
            var newIssue = {
                "fields": {
                    "issuetype": {
                        "id": currentFields.issuetype.id
                    },
                    "priority": {
                        "id": currentFields.priority.id
                    },
                    "project": {
                        "id": currentFields.project.id
                    },
                    "summary": currentFields.summary,
                    "description": (currentFields.description) ? currentFields.description : ""
                }
            };
            
            //Components
            if(Array.isArray(currentFields.components) && currentFields.components.length) {
              newIssue.fields.components = currentFields.components.map( c => { var n = {}; n["id"] = c.id; return n; } );
            }

            //Custom fields
            for (var key in issueTypeFields) {
                if (key.startsWith('customfield_') && currentFields.hasOwnProperty(key)) {

                    var value = customizeValue(key, currentFields[key])

                    if (value) {
                        newIssue.fields[key] = value;
                    }
                }
            }

            var data = JSON.stringify(newIssue);

            $.ajax({
                url: API_URL,
                type: "POST",
                data: data,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    console.log('[jira-issue-clone][createNewIssue] ' + JSON.stringify(data));

                    window.location = BROWSE_URL + data.key;
                }
            })
                .fail(handleAjaxError)
                .fail(function () {
                    hideProgress();
                });
        }
        catch (err) {
            alert(err.message);
        }
    };

    /**
    * Manipulate values, e.g. customfield_10005 in our case is not wanted during clone so setting the value to null so that it won't be cloned
    */
    function customizeValue(key, value) {
        var result = value;

        if ("customfield_10005" === key) { // sprint id
            result = null;
        };

        return result;
    }

    /**
    * Central error handler for ajax requests.
    */
    function handleAjaxError(jqXHR, exception, errorThrown) {

        var msg = '';

        if (jqXHR.status === 0) {
            msg = 'Not connected. Verify Network.';
        } else if (jqXHR.status == 404) {
            msg = 'Requested page not found [404]';
        } else if (jqXHR.status == 500) {
            msg = 'Internal Server Error [500]';
        } else if (exception === 'parsererror') {
            msg = 'Requested JSON parse failed';
        } else if (exception === 'timeout') {
            msg = 'Time out error';
        } else if (exception === 'abort') {
            msg = 'Ajax request aborted';
        } else {
            msg = 'Uncaught Error.\n' + jqXHR.responseText;
        };

        console.log("[jira-issue-clone][handleAjaxError] jQuery XHR Exception. Status: " + jqXHR.status + ". Exception: " + exception + ". Information: " + msg + ". Error Thrown" + errorThrown);

        alert(msg + '.\n\nAn error occurred. Look at the console (F12 or Ctrl+Shift+I, Console tab) for more information.');
    };

    // Add the clone button if an issue is refreshed, because a refresh will remove the clone button added by the NEW_CONTENT_ADDED event
    JIRA.bind(JIRA.Events.ISSUE_REFRESHED, function (context, issueId) {
        console.log('[jira-issue-clone][ISSUE_REFRESHED]: Add Clone button for issue id: ' + issueId);
        addCloneButton(issueId);
    });

    //Add the clone button if an issue is opened, using the pageLoad for an issue-container
    JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED, function (e, context, reason) {
        if ('pageLoad' === reason && context.selector.includes('.issue-container')) {
            var issueKey = $("meta[name='ajs-issue-key']").attr("content");
            console.log('[jira-issue-clone][NEW_CONTENT_ADDED]: Add Clone button for issue key: ' + issueKey);
            addCloneButton(issueKey);
        }
    });
};

/**
 *Main function to inject the code of the jira-issue-clone extension into the JIRA website
 */
(function (callback) {
    'use strict';
    try {
        var scripts = "(" + callback.toString() + ")(window.AJS.$);";
        injectsome.content.script(scripts);
    } catch (err) {
        console.log('[jira-issue-clone] ' + err.message);
    }
})(scriptToInject);
