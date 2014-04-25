# SJgrabber

> *your* favourite releases from [serienjunkies.org](http://serienjunkies.org/)!  
> http://majodev.github.io/sjgrabber

## About
SJgrabber parses RSS feeds and HTML pages from [serienjunkies.org](http://serienjunkies.org/). 
It assists you to **grab links** from **the latest episodes** for your **favourite** TV shows.

## Warning
**SJgrabber is only an indexing service and therefore legal, but downloading copyrighted material isn't!** For the record, I'm neither cooperating with [serienjunkies.org](http://serienjunkies.org/) nor responsible for any content that is hosted/uploaded on [serienjunkies.org](http://serienjunkies.org/) or gets downloaded from there.  

**Respect copyright law and their holders!**

## Downloading
Get SJgrabber for your platform from **[GitHub Releases](https://github.com/majodev/sjgrabber/releases)**!

## Installing
There is no need to explicitly install SJgrabber. **Unzip**, move it anywhere you want and **run** it.

### Windows
Open `Start SJgrabber.exe` **or** `SJgrabber.exe` after unzipping.

#### Why are there 2 executables in the Windows builds?
One has the right icon, the other one doesn't. I did this to [tackle a current limitation in the automated build process of SJgrabber](https://github.com/mllrsohn/grunt-node-webkit-builder/issues/78) using [grunt-node-webkit-builder](https://www.npmjs.org/package/grunt-node-webkit-builder).

### Mac
Open `SJgrabber.app` after unzipping. 

#### Unidentified developer warning?
**TL;DR**: *right click + open* **or** *hold control-key + double-click* to open SJgrabber for the first time.

I don't have acquired a developer certificate from Apple (paying 99$ per year doesn't sound reasonable to me) so you might have problems to [open apps from unidentified developers](http://support.apple.com/kb/PH14369).

### Linux
You will need to manually set the *executable flag* of the SJgrabber binary (`chmod +x SJgrabber`) after unzipping!

### NW
I also distribute NW builds (`SJgrabber.nw` after unzipping), however you need to download the most current version of [node-webkit](https://github.com/rogerwang/node-webkit) to run it!

## Upgrading
Your current configuration, fetched favourites, releases and links are kept separately, just launch a newer version of SJgrabber and you are set (feel free to delete previous versions of SJgrabber without any consequences)!

## Support
Please feel free to donate a beer via bitcoins `1KaeuK2WpwkhK9T3eURK7uxB3frgD8Z4HV`, via <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=mario%2eranftl%40gmail%2ecom&lc=AT&item_name=a fresh and cold SJgrabber thank you beer&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted">paypal</a> or via <a href="https://www.gittip.com/majodev/">gittip</a>.  
Thank you VERY VERY much!

I'm also accepting nice words on twitter [@majodev](https://twitter.com/majodev), thx!

## Bugs, feature requests and disgust
Open an [issue on GitHub](https://github.com/majodev/sjgrabber/issues)!

## Genesis
Several 'friends of mine' were *sick* of skimming [serienjunkies.org](http://serienjunkies.org/) **each and every day** for new releases of their favourite TV shows. As I have a lot of freetime currently (after graduating from an IT master program in Austria), I decided to develop a tiny app to **assist** them. 

SJgrabber soon became quite polished, hence it was time to publish it and that's it (anyways, feel free to spot evil intentions...).

## Tech
SJgrabber is powered by [node-webkit](https://github.com/rogerwang/node-webkit) and distributed as self-contained app for each platform.  
It's really just HTML/CSS/JS!

## Building
> Only for the brave and nerdy!

### Prerequisites
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
While developing it's better to run SJgrabber straight with node-webkit and devtools enabled (the flag `NWAPP_DEBUG` in `package.json` handles setting up a debug environment). Get going by executing `nw .` within your working directory (put the [node-webkit](https://github.com/rogerwang/node-webkit) executable into your `PATH`). 

**Important**: SJgrabber reads and saves your data to separate `localStorage` fields during debug-sessions, so developing and enhancing doesn't interfere with your productive use of SJgrabber. Feel free to wipe fetched releases and favourites as you please.

### Tasks
If you plan to make changes to any handlebars template in `/client/templates` or `LICENSE.md` and `README.md`, the `watch` task might become handy, as it automatically executes `build-static` after modifications.

The **default** `grunt` task builds, bundles and compresses win32, mac, linux32, linux64 and nw releases into `/dist`. If you have come this far, you'll have the same release-ready builds which I'm distributing here! It executes the following tasks:
* `build` (with 3 essential sub-tasks)
  - `build-static`: template and support file compilation
  - `build-js`: minification (HTML, CSS), uglyfication (JS), dependency retrieval (npm packages without dev-only) and copying `/build-templates`
  - `build-nw`: node-webkit packaging
* `release`: compressing to `/dist` and cleanup

## Contributors
* [Nicole Eibel](http://nicoleeibel.at/) (brand/logo design)

## License
SJgrabber is licensed under the MIT License  
Copyright (c) 2014 Mario Ranftl ([@majodev](https://twitter.com/majodev))

See **LICENSE.md** (or **LICENSE.html** within distributed apps) for more detailed license info and 3rd party licenses.

See **credits.html** for [node-webkit](https://github.com/rogerwang/node-webkit) redistributable licenses (platform dependent, this file ONLY ships with SJgrabber binaries).