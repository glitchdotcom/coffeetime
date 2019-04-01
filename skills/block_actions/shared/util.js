const setup = {
  YES_INSTALL_VALUE: "setup_yes_install",
  YES_INSTALL_MENU_VALUE: "setup_yes_install_menu",
  NO_INSTALL_VALUE: "setup_no_dont_install",
  ALL_VALUE: 'subscribe_all',
  ME_VALUE: 'subscribe_me',
  NOBODY_VALUE: 'subscribe_nobody',
  HELP_VALUE: 'subscribe_help',
  CANCEL_VALUE: 'subscribe_cancel',
  ALL_CONFIRMED_VALUE: 'subscribe_all_confirmed'
};

const help = {
  SUBSCRIBE_VALUE: "yes_install",
  UNSUBSCRIBE_VALUE: "yes_install_menu",
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
  help
}