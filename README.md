# SJgrabber

> *your* favourite releases from serienjunkies.org!  
> http://majodev.github.io/sjgrabber

## About
SJgrabber parses RSS feeds and HTML pages from [serienjunkies.org](http://serienjunkies.org/). 
It assists you to **grab links** from **the latest episodes** for your **favourite** TV shows.

## Warning
**SJgrabber is only an indexing service and therefore legal, but downloading copyrighted material isn't!** For the record, I'm neither cooperating with serienjunkies.org nor responsible for any content that is hosted/uploaded on serienjunkies.org or gets downloaded from there.  

**Respect copyright law and their holders!**

## Downloading
Get SJgrabber for your platform from [GitHub Releases](https://github.com/majodev/sjgrabber/releases)

## Installing
There is no need to explicitly install SJgrabber. Unzip, move it anywhere you want and run it.  
**Heads up linux users:** You have to manually set the executable flag of the SJgrabber binary!

## Upgrading
Your current configuration, fetched favourites, releases and links are kept separately, just launch a newer version of SJgrabber and you are set (feel free to delete previous versions of SJgrabber without any consequences)!

## Genesis
Several 'friends of mine' were *sick* of skimming serienjunkies.org **each and every day** for new releases of their favourite TV shows. As I have a lot of freetime currently (after graduating from an IT master program in Austria), I decided to develop a tiny app to **assist** them. 

SJgrabber soon became quite polished, hence it was time to publish it and that's it (anyways, feel free to spot evil intentions...).

## Bugs, feature requests and disgust
Open an issue on GitHub!

## Support
Please feel free to donate a bitcoin-beer to `1KaeuK2WpwkhK9T3eURK7uxB3frgD8Z4HV`.  
Thank you VERY VERY much!

I'm also accepting nice words on twitter [@majodev](https://twitter.com/majodev), thx!

## Tech
SJgrabber is powered by [node-webkit](https://github.com/rogerwang/node-webkit) and distributed as self-contained app for each platform.  
It's really just HTML/CSS/JS!

## Building
Wanna build SJgrabber yourself?
* get [node.js](http://nodejs.org/), install it and make yourself comfortable with [npm](https://www.npmjs.org/)
* install [grunt](http://gruntjs.com/) globally
* install [bower](http://bower.io/) globally

### Setup
```bash
git clone https://github.com/majodev/sjgrabber.git
cd sjgrabber
npm install -d
bower install -d
grunt build-static
```

### Debugging
While developing it's better to run the SJgrabber straight with node-webkit and devtools enabled (the flag `NWAPP_DEBUG` in `package.json` handles setting the debug environment). Get going by executing `nw .` within your working directory (put the [node-webkit](https://github.com/rogerwang/node-webkit) executable into your `PATH`).

### Tasks
If you plan to make changes to the handlebars templates in `client/templates`, the `watch` task might become handy, as it automatically compiles to `client/templates.js` every time you make changes there.

The default `grunt` task builds, bundles and compresses win32, mac, linux32, linux64 and nw releases into `/dist`. If you have come this far, you'll have the same release-ready builds which I'm distributing here!

## Contributors
* [Nicole Eibel](http://nicoleeibel.at/) (brand/logo design)

## License
SJgrabber is licensed under the MIT License  
Copyright (c) 2014 Mario Ranftl ([@majodev](https://twitter.com/majodev))

See **LICENSE.md** (or **LICENSE.html** within distributed apps) for more detailed license info and 3rd party licenses.

See **credits.html** for [node-webkit](https://github.com/rogerwang/node-webkit) redistributable licenses (platform dependent, this file ONLY ships with SJgrabber binaries).