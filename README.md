# jira-issue-clone
Creates a JIRA ticket in the browser. It provides a workaround for two permission issues:
- When you don't have the permission to clone a ticket on the JIRA server
- When you want to workaround the problem that the official clone function sets the wrong reporter on the cloned ticket, if you don't have the "Modify Reporter" permission: https://jira.atlassian.com/browse/JRASERVER-23538

## installation
- Install Greasemonkey for Firefox (tested). For Chrome, Tampermonkey should work as well (not tested).
- Create a new user script
- copy past the content of __jira-issue-clone.user.js__ into the new script
- modify the @include meta header to match your installation of JIRA
- replace [your-jira-server] with the base Url of your  installation of JIRA
