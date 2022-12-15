---
title: Newcomer Guide
category: General
order: 5
---

# Nimbus Newcomer Guide

Hi and welcome to the Nimbus Newcomer Guide.

This should hopefully answer all the questions you might have and also be interesting to read for people that haven't been following the recent development.

_Last update: 2022-12-06_


## What is Nimbus?

Nimbus is a cloud replacement for vacuum robots enabling local-only operation. It is not a custom firmware.
That means that it cannot change anything about how the robot operates.

What it can do however is protecting your data and enable you to connect your robot
to your home automation system without having to detour through a vendor cloud, which,
apart from the whole data problematic, might not be reachable due to your internet connection
being down or some servers in the datacenter being on fire.

Not having to leave your local network of course also benefits the latency of commands, status reports etc.

Nimbus aims to be proof that easy to use and reliable smart appliances are possible without any cloud and/or account requirements.
Maybe at some point it might help convince vendors that there is another way of doing things.

If you want to learn more about why someone would want to use something like Nimbus, check out the [Why Nimbus?](https://nimbus.cleaning/pages/general/why-nimbus.html) page.

If you want to learn more about why someone would **not** want to use something like Nimbus, check out the [Why not Nimbus?](https://nimbus.cleaning/pages/general/why-not-nimbus.html) page.

## Who is Nimbus for?

Nimbus can be used by anyone with a basic understanding of the english language.

**Note:**<br/>
While Nimbus can be **used** by anyone with a basic understanding of the english language, it cannot be **installed**
just with those skills.

To install Nimbus you will need some understanding of linux-ish operating systems as well as computers in general
and maybe even some basic hardware hacking stuff.
If you lack these skills, please consider asking a friend or computer repair shop to help you with that.

As Nimbus is just the hobby project of some guy on the internet, it is not possible (nor intended) for it to provide
first-level/tier-one support.

## What can Nimbus do?

By default, Nimbus provides control over your vacuum robot via a **responsive webinterface** that works on all of your devices.
It can be used on phones, tablets as well as your desktop computer.

Furthermore, there's a **REST-interface** documented with **Swagger UI** as well as **MQTT**.
With support for both **Homie** and **Home Assistant Autodiscovery** for MQTT, you're able to connect Nimbus to
the open-source smarthome software of your choice.

Make sure to check out the [MQTT Docs](https://nimbus.cleaning/pages/integrations/mqtt.html) as well as the
[OpenHAB integration](https://nimbus.cleaning/pages/integrations/openhab-integration.html).

Nimbus fully supports:

- Room Cleaning, splitting, merging and renaming
- Water Pump controls and editing no-mop zones
- Editing Virtual Walls, No-Go Areas
- Dynamic zoned cleanup
- Go-To locations
- Start/Stop/Home/Locate and Fan speed control
- Consumables monitoring
- Carpet mode and persistent data control
- Audio volume control

as long as your robots firmware can actually do that.

By replacing the cloud, you also gain access to your own data, which you can use however you like.

For example there are already a few applications that turn your map data into various other formats such as [Minecraft Worlds
or Source-Engine maps](https://nimbus.cleaning/pages/companion_apps/fun_games.html). There's a huge amount of possibilities yet to be explored.

Due to the openly documented, standardized and easily accessible Map Data, one can use any Nimbus-compatible Vacuum Robot to map out
a new home, write some glue code to transform it into the 3d software of their choice and use that precise floor plan to
figure out where to put the furniture.

Furthermore, the standardised Nimbus API allows for the creation of companion services such as [Valeronoi](https://github.com/ccoors/Valeronoi),
which can build a Wi-Fi signal heatmap from the data provided by Nimbus.


## Which robot should I buy to use it with Nimbus?

To choose the right robot to buy, head over to [Buying supported robots](https://nimbus.cleaning/pages/general/buying-supported-robots.html).

If you want to use Nimbus, please buy a supported robot.

Please refrain from buying any random robot just to then ask how we can make Nimbus on that thing happen.<br/>
Unless there are very good reasons to support a new Model/Brand/etc. such as
- amazing new features. which provide something that isn't available on anything else currently supported
- older supported models becoming EOL and getting hard to buy

it likely won't happen as chosen the strategy is to stick to a few well-supported and actually good models.

## How do I install Nimbus?

The [getting started guide](https://nimbus.cleaning/pages/general/getting-started.html) is a good place to start.

## How can I contribute to Nimbus?

### As a regular user

You don't need to be a developer to contribute to Nimbus, because the best way to support the project is to support other Nimbus users of which there are quite a few.

Just stick around in the Telegram Group, the IRC and/or the GitHub Discussions :)

### As a developer

If you're a developer, the usual stuff applies.
They may be Issues tagged with "Good First Issue" which should be the right place to start.

If you intend to add a new feature, you should expect the discussion thread to be open at least a few weeks until you can start working on that.
Please note that no response doesn't mean yes. PRs not following these rules will be closed without further discussion
