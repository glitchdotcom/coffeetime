const setup = {
  YES_INSTALL_VALUE: "yes_install",
  NO_INSTALL_VALUE: "no_dont_install",
};

function createButton(text, value) {
  return {
    "type": "button",
    "text": {
      "type": "plain_text",
      "text": text,
      "emoji": true
    },
    "value": value
  };
}

function createActions(...elements) {
  return {
    "type": "actions",
    "elements": elements
  };
}

function createSection(text) {
  return {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": text
    }
  };
}

function createBlocks(text) {
  return {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": text
    }
  };
}

const blocks = {
  createButton,
  createActions
};

module.export = {
  setup,
  blocks
}