# jira-issue-clone v2.1

![license:mit](https://img.shields.io/github/license/BartJolling/jira-issue-clone.svg?logo=github&style=plastic&logoColor=white)
![github:stars](https://img.shields.io/github/stars/BartJolling/jira-issue-clone.svg?logo=github&style=plastic&logoColor=white)
![gitHub:issues](https://img.shields.io/github/issues/BartJolling/jira-issue-clone?logo=github&style=plastic&logoColor=white)
![gitHub:forks](https://img.shields.io/github/forks/BartJolling/jira-issue-clone?logo=github&style=plastic&logoColor=white)


## Description
Adds a "Clone"button to the "browse" screen of a JIRA issue, allowing to clone it in the browser. This version has been fully tested on **Jira 8.1**. 

It should be backwards compatible with Jira 7.8 but this is not guaranteed. In case it doesn't work, install [v2.0 of this userscript](https://github.com/BartJolling/jira-issue-clone/tree/release-2.0).

jira-issue-clone provides a workaround for two permission limitations:
- When you don't have the permission to clone a ticket on the JIRA server itself.
- When you want to workaround the problem that the official clone function sets the wrong reporter on the cloned ticket, if you don't have the "Modify Reporter" permission: https://jira.atlassian.com/browse/JRASERVER-23538

## Installation Mozilla Firefox
- [Install GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
- [Install jira-clone-issue](https://github.com/BartJolling/jira-issue-clone/raw/master/jira-issue-clone.user.js "Install jira-issue-clone")

## Installation Google Chrome
- [Install TamperMonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Install jira-clone-issue](https://github.com/BartJolling/jira-issue-clone/raw/master/jira-issue-clone.user.js "Install jira-issue-clone")

## Installation Microsoft Edge
- [Install TamperMonkey](https://www.microsoft.com/en-us/p/tampermonkey/9nblggh5162s)
- [Install jira-clone-issue](https://github.com/BartJolling/jira-issue-clone/raw/master/jira-issue-clone.user.js "Install jira-issue-clone")

## Usage/Known Issues
- Cloning an issue can take a few seconds. During that time, a spinner will be displayed next to the clone button and you should avoid interacting with the screen. Once the cloning operation has been successful, you will be redirected to the newly cloned issue.
- As I don't have a test environment with Jira 7.8 anymore, I can only support it on a best effort basis. I cannot guarantee that future modifications will continue to work on older versions than v8.1.
