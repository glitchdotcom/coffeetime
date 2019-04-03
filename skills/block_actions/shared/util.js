//////////////////////////////////////
// Note: ALL string values in this section must be unique, as they are used by Slack
// to distiniguish responses to interactive menus!
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
  EXIT_MENU_VALUE: 'help_exit_menu_value',
  WHAT_ARE_COMMANDS_VALUE: 'help_what_are_commands_value',
  SET_MANAGER_MENU_VALUE: 'help_set_manager_menu_value',
  SELECT_MANAGER_ACTION_ID: 'help_select_manager_action_id',
  UNSELECT_MANAGER_VALUE: 'help_unselect_manager_value'
};

const admin = {
  SHOW_MENU_VALUE: 'admin_show_menu_value',
  SHOW_ALL_SUBSCRIBED: 'admin_show_all_subscribed',
  SHOW_ALL_UNSUBSCRIBED: 'admin_show_all_unsubscribed',
  EXIT_MENU_VALUE: 'admin_exit_menu_value',
  
  SUBSCRIBE_EVERYONE: 'admin_subscribe_everyone',
  SUBSCRIBE_EVERYONE_CONFIRM: 'admin_subscribe_everyone_confirm',
  
  SUBSCRIBE_USER: 'admin_subscribe_user',
  UNSUBSCRIBE_USER: 'admin_unsubscribe_user',
  SELECT_SUBSCRIBER_ACTION_ID: 'admin_select_subscriber_action_id',
  ADD_USER_CONFIRM_VALUE: 'admin_add_user_confirm_value',
  
  SEE_SCHEDULE_VALUE: 'admin_see_schedule',
  SET_SCHEDULE_VALUE: 'admin_set_schedule',
  RUN_COFFFEETIME_NOW: 'admin_run_coffeetime_now'

};

//////////////////////////////////////

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

function userSelect(placeholderText, actionId, initialUserId) {
  return {
    "type": "users_select",
    "placeholder": {
      "type": "plain_text",
      "text": placeholderText,
      "emoji": true
    },
    "action_id": actionId,
    "initial_user": initialUserId
  };
}

function context(messageText) {
  return {
		"type": "context",
		"elements": [
			{
				"type": "mrkdwn",
				"text": messageText
			}
		]
	}
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
  section,
  userSelect,
  context
};

module.exports = {
  admin,
  setup,
  blocksBuilder,
  help
}