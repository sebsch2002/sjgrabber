Welcome to SJgrabber - your favourite releases from serienjunkies.org!
http://majodev.github.io/sjgrabber

* About *
SJgrabber parses RSS feeds and HTML pages from serienjunkies.org. 
It assists you to GRAB LINKS from THE LATEST episodes for your FAVOURITE TV shows.

* WARNING *
SJgrabber is only an indexing service and therefore legal, but downloading copyrighted material isn't! For the record, I'm neither cooperating with serienjunkies.org nor responsible for any content that is hosted/uploaded on serienjunkies.org or gets downloaded from there.

* History *
Several 'friends of mine' were sick of skimming serienjunkies.org each and every day for new releases of their favourite TV shows. As I have a lot of freetime currently (after graduating from an IT master program), I decided to develop a tiny app to assist them. SJgrabber soon became quite polished, hence it was time to publish it, and here it is.

* Downloading *
Get SJgrabber for YOUR platform from https://github.com/majodev/sjgrabber/releases

* Installing *
There is no need to explicitly install SJgrabber. Unzip, move it anywhere you want and run it!

* Upgrading *
Your current configuration, fetched favourites, releases and links are kept separately, just launch a newer version of SJgrabber and you are set (feel free to delete previous versions of SJgrabber)!

* Problems and feature requests *
Open an issue on GitHub!

* Support *
Feel free to donate a bitcoin-beer to 1KaeuK2WpwkhK9T3eURK7uxB3frgD8Z4HV
Thank you VERY VERY much!

* Building *
SJgrabber is powered by node-webkit and distributed as self-contained app for each platform. It's just HTML/CSS/JS!

Wanna build it yourself?
get node.js (you will also need npm, grunt and bower installed globally)

  git clone https://github.com/majodev/sjgrabber.git
  cd SJgrabber
  npm install -d
  bower install -d
  grunt (to build and pack win32, mac, linux32 and linux64 releases into /dist)

* LICENSE INFORMATION *
SJgrabber is licensed under the MIT License (MIT)
Copyright (c) 2014 Mario Ranftl (@majodev)

see LICENSE.txt for SJgrabber specific licenses 
see credits.html for node-webkit redistributable licenses (platform dependent, this file ONLY ships with SJgrabber binaries)