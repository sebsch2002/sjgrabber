# SJgrabber

> Welcome to SJgrabber - your favourite releases from serienjunkies.org!
http://majodev.github.io/sjgrabber

## About
SJgrabber parses RSS feeds and HTML pages from serienjunkies.org. 
It assists you to **grab links** from **the latest episodes** for your **favourite** TV shows.

## WARNING
**SJgrabber is only an indexing service and therefore legal, but downloading copyrighted material isn't!** For the record, I'm neither cooperating with serienjunkies.org nor responsible for any content that is hosted/uploaded on serienjunkies.org or gets downloaded from there.

## History
Several 'friends of mine' were sick of skimming serienjunkies.org each and every day for new releases of their favourite TV shows. As I have a lot of freetime currently (after graduating from an IT master program), I decided to develop a tiny app to assist them. 

SJgrabber soon became quite polished, hence it was time to publish it, and here it is.

## Downloading
Get SJgrabber for your platform from https://github.com/majodev/sjgrabber/releases

## Installing
There is no need to explicitly install SJgrabber. Unzip, move it anywhere you want and run it.  
**Heads up linux users:** You have to manually set the executable flag of the SJgrabber binary!

## Upgrading
Your current configuration, fetched favourites, releases and links are kept separately, just launch a newer version of SJgrabber and you are set (feel free to delete previous versions of SJgrabber without any consequences)!

## Bugs, feature requests and disgust
Open an issue on GitHub!

## Support
Feel free to donate a bitcoin-beer to `1KaeuK2WpwkhK9T3eURK7uxB3frgD8Z4HV` Thank you VERY VERY much!

I'm also accepting nice words on twitter @majodev.

## Tech
SJgrabber is powered by node-webkit and distributed as self-contained app for each platform. It's really just HTML/CSS/JS!

## Building
Wanna build SJgrabber yourself?
get node.js (you will also need npm, grunt and bower installed globally)

### Setup

```bash
git clone https://github.com/majodev/sjgrabber.git
cd sjgrabber
npm install -d
bower install -d
```

### Grunt task
the following task builds and packs win32, mac, linux32 and linux64 releases into /dist
```bash
grunt
```

## LICENSE INFORMATION
SJgrabber is licensed under the MIT License (MIT)

Copyright (c) 2014 Mario Ranftl (@majodev)

see LICENSE.md/LICENSE.html for SJgrabber specific licenses

see credits.html for node-webkit redistributable licenses (platform dependent, this file ONLY ships with SJgrabber binaries)