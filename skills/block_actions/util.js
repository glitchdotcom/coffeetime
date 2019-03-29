const setup = {
  YES_INSTALL_VALUE: "yes_install",
  NO_INSTALL_VALUE: "no_dont_install",
};

const subscribe = {
  ALL: 'subscribe_all',
  ME: 'subscribe_me',
  NOBODY: 'subscribe_nobody',
  HELP: 'subscribe_help'
};

function button(text, value) {
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

function actions(...elements) {
  return {
    "type": "actions",
    "elements": elements
  };
}

function section(...text) {
  return {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": text.join('\n')
    }
  };
}

const blocksBuilder = {
  button,
  actions,
  section
};

module.exports = {
  setup,
  blocksBuilder,
  subscribe
}