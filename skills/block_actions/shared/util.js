const setup = {
  YES_INSTALL_VALUE: "setup_yes_install",
  YES_INSTALL_MENU_VALUE: "setup_yes_install_menu",
  NO_INSTALL_VALUE: "setup_no_dont_install",
  ALL_VALUE: 'setup_subscribe_all',
  ME_VALUE: 'setup_subscribe_me',
  NOBODY_VALUE: 'setup_subscribe_nobody',
  HELP_VALUE: 'setup_subscribe_help',
  CANCEL_VALUE: 'setup_subscribe_cancel',
  ALL_CONFIRMED_VALUE: 'setup_subscribe_all_confirmed'
};

const help = {
  SUBSCRIBE_ME_VALUE: 'help_subscribe_me',
  UNSUBSCRIBE_ME_VALUE: 'help_unsubscribe_me',
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