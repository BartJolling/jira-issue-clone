# jira-issue-clone

## Description
Adds a "Clone"button to the "browse" screen of a JIRA issue, allowing to clone it in the browser. It provides a workaround for two permission limitations:
- When you don't have the permission to clone a ticket on the JIRA server itself.
- When you want to workaround the problem that the official clone function sets the wrong reporter on the cloned ticket, if you don't have the "Modify Reporter" permission: https://jira.atlassian.com/browse/JRASERVER-23538

## Installation
- Install Greasemonkey for Firefox (tested). For Chrome, Tampermonkey should work as well (not tested).
- Create a new user script
- Copy/paste the content of __jira-issue-clone.user.js__ into the new script
- Modify the @include meta header to match your installation of JIRA
- Replace [your-jira-server] with the base Url of your  installation of JIRA
- Review and adapt the code to properly deal with your custom field configuration

## Usage/Known Issues
The clone button only gets added to the /browse/ page, when the page is loaded or refreshed. If you open an issue and don't see the button, press the <F5> function key to refresh.
Cloning an issue can take a few seconds. Once the cloning operation has been succesfull, you will be redirected to the newly cloned issue.
