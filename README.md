# Mudslide

![Logo](https://github.com/robvanderleek/mudslide/blob/main/doc/mudslide-logo-180x180.png?raw=true)

Send WhatsApp messages from the command-line, see also this [Medium post](https://levelup.gitconnected.com/how-to-send-whatsapp-messages-from-the-command-line-d1afd8b55de5).

This project is based on [Baileys](https://github.com/adiwajshing/Baileys), a full-featured WhatsApp Web+Multi-Device 
API library (in case you're wondering about the name, a Mudslide is a Baileys cocktail).

Keep in mind that the working of Mudslide depends on the Baileys library and
since that is not an official supported library by WhatsApp it could stop
working without notice.

Table of Contents:
* [Installation](#installation)
* [Usage](#usage)
* [Configuration](#configuration)
* [Feedback, suggestions and bug reports](#feedback-suggestions-and-bug-reports)
* [Contributing](#contributing)
* [License](#license)

# Installation

Using `npx`, installation is not necessary. You can run Mudslide on a system
with NodeJS 16 or higher from the command-line as follows:

```shell
npx mudslide -V
```

this should display the version number of the latest release.

Using `npm` Mudslide can be installed globally as follows:

```shell
npm install -g mudslide
```

## Platform binaries

Binaries for different platforms (Linux, Windows) are available on the [latest
release page](https://github.com/robvanderleek/mudslide/releases/latest). 

## Docker

Mudslide can also run inside a Docker container, you can build the Docker image
using the supplied `Dockerfile`:

```shell
docker build -t mudslide .
```

Test if the build was successful:

```shell
docker run -it mudslide
```

Since Mudslide keeps authentication state on disk you need to mount a state
directory outside the container, for example:

```shell
docker run -v /home/<USERNAME>/.local/share/mudslide:/usr/src/app/cache login
```

# Usage

Available commands and options can be listed with `--help` flag:

```shell
npx mudslide --help
```

for most command it's necessary that you've authorized Mudslide to interact
with the WhatsApp API on your behalf.  This can be done by logging in as
described below.

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

In the WhatsApp mobile app go to "Settings > Connected Devices > Connect
Device" and scan the QR code. Wait until the status is "active", then you can
exit Mudslide.

## Logout

Logging out removes credentials from your local environment but will not
disconnect Mudslide from your WhatsApp account, you can disconnect Mudslide
using the WhatsApp app.

```shell
npx mudslide logout
```

## Different types of recipients

Muslide supports three types of recipients for sending messages/images/files/etc.:

1. An international phone number (e.g.: `3161234567890`)
2. The authenticated user: `me`
3. A so-called WhatsApp ID, for example a group ID: `123456789-987654321@g.us`

## Sending a message to yourself or a phone number

Using the recipient `me` you can send yourself a test message:

```shell
npx mudslide send me 'hello world'
```

To send a message to a phone number:

```shell
npx mudslide send 3161234567890 'hello world'
```

To send a message to a group you are particpating in you need the group ID (see
the `mudslide groups` command).  Send a message to a group as follows:

```shell
npx mudslide send 123456789-987654321@g.us 'hello world'
```

Use `\n` to send a message with a newline, for example:

```shell
npx mudslide send me 'hello\nworld'
```

## Sending an image file

Image files (PNG, JPG, GIF) can be sent to individuals or groups:

```shell
npx mudslide send-image me image.png
```

```shell
npx mudslide send-image 123456789-987654321@g.us image.jpg
```

### Image captions

Use the `--caption` option to add a caption to the image:

## Sending other files

Single files can be sent to individuals or groups:

```shell
npx mudslide send-file me test.json
```

```shell
npx mudslide send-file 123456789-987654321@g.us document.pdf
```

```shell
npx mudslide send-image --caption 'Your text here' me image.png
```

## Sending a location

Geographic locations can be sent to individuals or groups using latitude and
longitude coordinates. For example, to position yourself at the Eiffel Tower:

```shell
npx mudslide send-location me 48.858222 2.2945
```

Or to send your location at the Sydney Opera House to a group:

```shell
npx mudslide send-location 123456789-987654321@g.us -33.857058 151.214897
```

## List your groups

To list all the groups you are participating in:

```shell
npx mudslide groups
```

this will show a list of group IDs and subjects.

## Show current user details

To get the WhatsApp ID of the logged in user:

```shell
npx mudslide me
```

# Configuration

By default WhatsApp credentials are cached in a folder located in the user's
home directory. This folder is `.local/share/mudslide'` on Linux & macOS and
`AppData\Local\mudslide\Data` on Windows.

A different location for the cache folder can be configured via the environment
variable `MUDSLIDE_CACHE_FOLDER` or the `-c`/`--cache` options.

# Development

## Running unit-tests

To run the unit-tests run this command:

```shell
yarn test
```

# Feedback, suggestions and bug reports

Please create an issue here: https://github.com/robvanderleek/mudslide/issues

# Contributing

If you have suggestions for how Mudslide could be improved, or want to report a
bug, [open an issue](https://github.com/robvanderleek/mudslide/issues)! All and
any contributions are appreciated.

# License

[ISC](LICENSE) © 2022 Rob van der Leek <robvanderleek@gmail.com>
(https://twitter.com/robvanderleek)
