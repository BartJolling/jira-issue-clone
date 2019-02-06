// ==UserScript==
// @name       Jira - Copy Paste into new ticket
// @namespace  http://bartjolling.github.io
// @version    1.0.1
// @include    *jira*/browse/*-*
// @require    http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @grant      none
// @run-at     document-end
// ==/UserScript==

var BROWSE_URL = "https://[your-server-url]/browse/"; 
var API_URL = "https://[your-server-url]/rest/api/latest/issue/";

/**
* Initialize the script.
* User-Agent must be blank to avoid JIRA issue with cross origin checks for Firefox.
* Add the 'Clone' button when user is on the /browse/ page
*/
$(document).ready(function() {
  
    $.ajaxSetup({
      beforeSend: function(request) {
        request.setRequestHeader("User-Agent","");
      }
    });
  
    path = window.location.pathname;
    
    if( path.startsWith("/browse/")) {
      addCloneButton();
    }    
});

/**
* Adds a 'Clone' button to the operations toolbar in JIRA
*/
function addCloneButton() {  
  try{
    $edit = $("#opsbar-opsbar-operations");
       
    var $clone = $('<a>').addClass('toolbar-trigger').click(cloneIssue).append(
          $('<span>').addClass('trigger-label').append("Clone"));
    
    $edit.append($('<li>').addClass('toolbar-item').append($clone));
  }
  catch(err) {
    alert(err.message);
  }
};

/**
* Main function that is execute when user clicks the clone button.
* Drives the process of retrieving info, building a new issue and submitting it.
*/
function cloneIssue() {
  try {
    var issueId = $("meta[name='ajs-issue-key']").attr("content");

    getCurrentIssueFields(issueId)
    .then(function(issue){
        var currentFields = issue.fields;        
        var projectId = currentFields.project.id;
        var issueTypeId = currentFields.issuetype.id;
        
        getIssueTypeFields(projectId, issueTypeId)
        .then(function(meta) {            
            var issueTypeFields = meta.projects[0].issuetypes[0].fields;          
            createNewIssue(currentFields, issueTypeFields);          
        })
        .error(handleJsonError);
    })
    .error(handleJsonError);
  }
  catch(err) {
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
     catch(err) {
      alert(err.message);
    }     
};

/**
* Returns a promise to load the fields on the create screen for a certain project and issue type.
* @param {string} projectId - id of the project to find the Create screen.
* @param {string} issueTypeId - id of the issue type to find the Create screen
*/
function getIssueTypeFields(projectId, issueTypeId) {
    try {
      var query = API_URL + "createmeta?projectIds="+ projectId +"&issuetypeIds="+ issueTypeId +"&expand=projects.issuetypes.fields";
      return $.getJSON(query);
    }
     catch(err) {
     alert(err.message);
    }  
};

/**
* Builds a new issue using information of the current issue, filtered down with the fields on the create screen.
* @param {string} currentFields - list of fields of the current issue.
* @param {string} issueTypeFields - list of fields on the Create screen for this issue type
*/
function createNewIssue(currentFields, issueTypeFields) {

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
            "description": currentFields.description,
            }
        };

        //Custom fields    
        for (var key in issueTypeFields) {
            if (key.startsWith('customfield_') && currentFields.hasOwnProperty(key)) {
              
                var value = customizeValue(key, currentFields[key])
                 
                if(value) {
                  newIssue.fields[key]=value;
                }
            }
        }        

        data = JSON.stringify(newIssue);

        $.ajax({
            url: API_URL,
            type: "POST",
            data: data,
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: function(data, textStatus, jqXHR) {
                console.log(data);
                console.log('jqXHR:');
                console.log(jqXHR);
                console.log('textStatus:');
                console.log(textStatus);
                console.log('data:');
                console.log(data);

                window.location = BROWSE_URL + data.key;
            }
        }).error(handleJsonError);
    }
    catch(err) {
        alert(err.message);
    }    
};

/**
* Manipulate values, e.g. customfield_10005 in our case is not wanted during clone so setting the value to null so that it won't be cloned
*/
function customizeValue(key, value) {
  var result = value;
  
  if("customfield_10005" === key) { // sprint id
   result = null;
  };
  
  return result;
}

/**
* Central error handler for ajax requests.
*/
function handleJsonError(jqXHR, textStatus, errorThrown) {
  alert('An error occurred. Look at the console (F12 or Ctrl+Shift+I, Console tab) for more information.');
  console.log('jqXHR:');
  console.log(jqXHR);
  console.log('textStatus:');
  console.log(textStatus);
  console.log('errorThrown:');
  console.log(errorThrown);
};
