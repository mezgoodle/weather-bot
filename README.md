# bot_template
My template for aiogram bots

<h1 id="project-title" align="center">
  bot_template <img alt="logo" width="40" height="40" src="https://raw.githubusercontent.com/mezgoodle/images/master/MezidiaLogoTransparent.png" /><br>
  <img alt="language" src="https://img.shields.io/badge/language-python-brightgreen?style=flat-square" />
  <img alt="issues" src="https://img.shields.io/github/issues/mezgoodle/bot_template?style=flat-square" />
  <img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed/mezgoodle/bot_template?style=flat-square" />
  <img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/mezgoodle/bot_template?style=flat-square" />
  <img alt="GitHub closed pull requests" src="https://img.shields.io/github/issues-pr-closed/mezgoodle/bot_template?style=flat-square" />
  <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/mezgoodle/bot_template?style=flat-square">
</h1>

<p align="center">
 🌟Hello everyone! This is the template for developing Telegram bots on Python with aiogram.🌟
</p>

## Motivation :exclamation:

When I was developing [Telegramia](https://github.com/mezidia/telegramia), I've used these templates: [aiogram-bot-template](https://github.com/Latand/aiogram-bot-template) and [tgbot_template](https://github.com/Latand/tgbot_template) for creating bots. And I have many probles with them. So I decided to create my own template.

## Diagram

Here you can understand how template works and what is imported from where.

```mermaid
classDiagram
    bot <|-- loader: dp
    bot <|-- aiogram: executor
    bot <|-- `tgbot.handlers`
    bot <|-- `tgbot.filters`: custom_filter
    bot <|-- `tgbot.middlewares` : custom_middleware
    bot <|-- `tgbot.services` : set_commands()
    bot <|-- `tgbot.config` : load_config()
    `tgbot.handlers` <|-- some_handler
    `tgbot.handlers` <|-- `tgbot.keyboards`: reply_keyboard, inline_keyboard
    `tgbot.handlers` <|-- `tgbot.middlewares` : rate_limit()
    `tgbot.handlers` <|-- `tgbot.states` : custom_state
    some_handler <|-- loader: dp
    loader <|-- `tgbot.config` : load_config()
    `tgbot.keyboards` <|-- reply
    `tgbot.keyboards` <|-- inline
    `tgbot.middlewares` <|-- custom_middleware
    `tgbot.services` <|-- set_default_commands
    class bot{
      Logger logger
      executor
      register_all_middlewares(dispatcher: Dispatcher)
      register_all_filters(dispatcher: Dispatcher)
      register_all_handlers(dispatcher: Dispatcher)
      register_all_commands(dispatcher: Dispatcher)
      on_startup(dispatcher: Dispatcher)
      on_shutdown(dispatcher: Dispatcher)
      executor.start_polling()
    }
    class aiogram{
        executor
    }
    class loader{
      Config config
      Bot bot
      Dispatcher dp
      MemoryStorage storage
    }
    class `tgbot.config`{
      load_config()
    }
    class `tgbot.handlers`{
    }
    class some_handler{
      
    }
    class `tgbot.filters`{
      custom_filter
    }
    class `tgbot.keyboards`{

    }
    class reply {
        reply_keyboard
    }
    class inline {
        inline_keyboard
    }
    class `tgbot.middlewares` {
        
    }
    class custom_middleware {
        rate_limit()
    }
    class `tgbot.misc` {
        
    }
    class `tgbot.models` {
        
    }
    class `tgbot.services` {
        
    }
    class set_default_commands {
        set_commands()
    }
    class `tgbot.states` {
        custom_state
    }
```

## Examples

- [genji-moderator](https://github.com/mezgoodle/genji-moderator)
- [Telegramia](https://github.com/mezidia/Telegramia)

## Installation :computer:

1. Clone the repository

```bash
git clone https://github.com/mezgoodle/bot_template.git
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

## Fast usage :dash:

1. Set the bot token in the tgbot.config.py file

2. Run the bot

```bash
python bot.py
```

## Contribute :running:

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Credits :cat::handshake:

- [aiogram-bot-template](https://github.com/Latand/aiogram-bot-template)
- [tgbot_template](https://github.com/Latand/tgbot_template)

## License :bookmark:

MIT © [mezgoodle](https://github.com/mezgoodle)
