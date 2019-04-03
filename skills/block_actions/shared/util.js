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
  BACK_TO_MAIN_VALUE: 'help_back_to_main',
  WHAT_IS_THIS_VALUE: 'help_what_is_this',
  WHO_IS_MY_BUDDY_VALUE: 'help_who_is_my_buddy',
  AM_I_SIGNED_UP_VALUE: 'help_am_i_signed_up',
  MY_PROFILE_VALUE: 'help_my_profile',
  SHOW_HELP_MENU: 'help_show_help_menu',
  EXIT_MENU_VALUE: 'exit_menu_value',
  WHAT_ARE_COMMANDS_VALUE: 'what_are_commands_value',
  SET_MANAGER_VALUE: 'set_manager_value'
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

function sectionWithAccessory(text, accessory) {
  return {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": text
    },
    accessory
  };
}

function userSelect(placeholder, actionId, ) {
}

function divider() {
  return 	{
		"type": "divider"
	};
}

const blocksBuilder = {
  button,
  actions,
  divider,
  section
};

module.exports = {
  setup,
  blocksBuilder,
  help
}