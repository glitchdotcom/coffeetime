const setup = {
  YES_INSTALL_VALUE: "yes_install",
  NO_INSTALL_VALUE: "no_dont_install",
};

const subscribe = {
  ALL_VALUE: 'subscribe_all',
  ME_VALUE: 'subscribe_me',
  NOBODY_VALUE: 'subscribe_nobody',
  HELP_VALUE: 'subscribe_help',
  CANCEL_VALUE: 'subscribe_cancel',
  PREVIEW_ALL_VALUE: 'subscribe_preview_all',
  SUBSCRIBE_ALL_CONFIRM: ''
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