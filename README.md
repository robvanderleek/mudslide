# Mudslide

![Logo](doc/mudslide-logo-180x180.png)

Send WhatsApp messages from the command-line.

This project is based on [Baileys](https://github.com/adiwajshing/Baileys), a full-featured WhatsApp Web+Multi-Device 
API library (in case you're wondering about the name, a Mudslide is a Baileys cocktail).

* [Installation](#installation)
* [Usage](#usage)
* [Configuration](#configuration)
* [Feedback, suggestions and bug reports](#feedback-suggestions-and-bug-reports)
* [Contributing](#contributing)
* [License](#license)

# Installation

Using `npx` installation is not necessary. You can run Mudslide on a system with NodeJS 16 or higher from the 
command-line as follows:

```shell
npx mudslide -V
```

this should display the version number of the latest release.

Using `npm` Mudslide can be installe globally as follows:

```shell
npm install -g mudslide
```

# Usage

Available commands and options can be listed with `--help` flag:

```shell
npx mudslide --help
```

for most command it's necessary that you've authorized Mudslide to interact with the WhatsApp API on your behalf. 
This can be done by logging in as described below.

## Login

To login you need to authorize Mudslide from another device that has WhatsApp installed and scan the QR code printed
in the terminal:

```shell
npx mudslide login
█▀▀▀▀▀█ ▀▀   ▀  █ █▀▀▀▀▀█
█ ███ █ █▄ █▀▀▀▀  █ ███ █
█ ▀▀▀ █ ▀█▀▀▄▀█▀▀ █ ▀▀▀ █
▀▀▀▀▀▀▀ ▀▄▀▄▀▄█▄▀ ▀▀▀▀▀▀▀
▀███▄ ▀▄▀▄   ▀▀ █▀ ▄▀▀▀▄▀
█▄▄▄▄ ▀ ▄  ▄▄▄█▄ ▄█▀ ▄▄  
▀▄ ▄▀ ▀ ▄█▄█ ▄ ▄ ██▄█ ▀▀█
▄▀▄██▀▀██▄▀ █▄▀▄▄█▀▄█ ▀▀▄
    ▀▀▀ ███▀▄▄  █▀▀▀█▀█▀█
█▀▀▀▀▀█   ▀▀█  ▄█ ▀ █ ▀██
█ ███ █ ▄▄█▀██▄▄▀██▀██▄▄▄
█ ▀▀▀ █ █▀▀▀▀▀ ▀▀█▀ █ █▀ 
▀▀▀▀▀▀▀ ▀▀▀ ▀ ▀  ▀ ▀▀▀▀▀▀
```

In the WhatsApp mobile app go to "Settings > Connected Devices > Connect Device" and scan the QR code.
Wait until the status is "active", then you can exit Mudslide.

## Logout

Logging our removes credentials from your local environment but will not disconnect Mudslide from your WhatsApp account, 
you can disconnect Mudslide using the WhatsApp app.

```shell
npx mudslide logout
```

## Sending a message to yourself or a phone number

Using the recipient `me` you can send yourself a test message:

```shell
npx mudslide send me 'hello world'
```

To send a message to a phone number:

```shell
npx mudslide send 3161234567890 'hello world'
```

## List your groups

To list all the groups you are participating in:

```shell
npx mudslide groups
```

this will show a list of group IDs and subjects.

## Sending a message to a group

To send a message to a group you are particpating in you need the numerical group ID (see the `mudslide groups` command).
Send a message to a group as follows:

```shell
npx mudslide send-group 123456789-987654321 'hello world'
```

## Show current user details

To get the WhatsApp ID of the logged in user:

```shell
npx mudslide me
```

# Configuration

# Feedback, suggestions and bug reports

# Contributing

# License