# Windows Build: Icon injection steps

Manual steps must be followed to get a proper icon of SJgrabber in windows builds. Injection takes place via [Anolis Ressourcer 0.9 Beta](http://anolis.codeplex.com/releases/view/32286), which is included in this repository.

1. Copy `nw.exe` from `/release/cache/win/x.x.x/` into this directory
2. Execute `patchIcon.bat` (on a windows computer) 
3. Replace this the new `nw.exe` with the old one

Done.