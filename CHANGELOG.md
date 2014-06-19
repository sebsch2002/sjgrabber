# Changelog

Rough overview of main changes between versions.

## 0.3.2
* `[all]` LocalStorage limit upped from 5MB to 500MB (+ catching `QuotaExceededError`)
* `[all]` `bad status code` and `unable to find link` errors now never raise an errorbox

## 0.3.1
* `[all]` Previous window position/dimension is now saved and restored on startup
* `[all]` FAQ updated, welcome screen/icons improved ([THX felsi](http://board.serienjunkies.org/index.php?page=Thread&threadID=73239))
* `[all]` Changelog added (ships with releases)
* `[all]` Added error reporting to universal analytics
* `[mac]` Startup-time improvement by using uncompressed app_files (but size increase)
* `[win]` Injected proper main application icon into nw.exe via batch-script (removed separate launcher.exe)

## 0.3.0
* `[all]` First public release

## Previous versions
* `[all]` Friends only releases