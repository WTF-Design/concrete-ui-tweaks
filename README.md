# ![C5](c5-wtf-gradient-optimized.svg) WTF Concrete UI Tweaks
User script for augmenting Concrete CMS development and administration.

## Requirements
- A user script host extension in your web browser
  - [Violentmonkey](https://violentmonkey.github.io/) is recommended

## Installation
- [Click here](https://github.com/WTF-Design/concrete-ui-tweaks/raw/main/script.user.js) to install/update

## Features
- May be documented at some point

## Changelog
1.13.1
- Normalize animation duration

1.13.0
- More methods of detecting Concrete login pages

1.12.0
- Fix login symbol vertical alignment where affected by site styles.

1.11.0
- Improve login page request code. We only need the response `ok`, not the content.

1.10.1
- Fix login state detection on concrete5 8.x

1.10.0
- Make Add-On changelogs less loud. H1s and H2s re-set to browser defaults over big and bold site theme headings. Also make path-based CSS injections introduce themselves via a comment line.

1.9.0
- Animate login button on hover to give some user feedback

1.8.0
- Use semantic versioning and improve login button environment detection

1.7.20240910
- Switch login icon to a more descriptive one from Google Material Symbols

1.6.20240910
- Supply in-house icon, disassociate from official Concrete CMS branding

1.5.20240730
- Added a thing that activates all the frame file paths on Concrete's debug stack trace page. Clicking on one copies the
path to the system clipboard provided that your site is served over HTTPS. The paths are pruned of relative path prefix
and line number suffix so you can just do Ctrl/Cmd-P in your editor and paste in the path to call up the file. One thing
specific to our dev environment is the use of [Lando](https://lando.dev) which means the file paths inside the server
container usually start with `/app/`. This is pruned as well, as it isn't visible to our editors. You may suggest other
pruneworthy path prefixes I don't plan to start guessing.

1.4.20240717
- Improve the look and feel of 9.x dev doc TOCs at https://documentation.concretecms.org/9-x/developers/

1.3.20240312
- To counteract unwanted password manager auto-fills on user profile pages, restore original field values after a small
delay.

1.2.20240202
- Use an embedded SVG of the Concrete CMS logo as the login button as not to depend on version specific paths. Very old
Concrete installs don't have the icon where 8/9 puts it. Also, the SVG doubles as the user script icon for clear visual
distinction inside user script host extensions with the added benefit of giving us a more polished look.

1.1.20230821
- Fix login form detection selector

1.0.20230816
- Initial release

## Aknowledgements
Uses [Google Material Symbols](https://fonts.google.com/icons) under the [Apache License Version 2.0](Google-Material-Symbols-LICENSE.txt) modified for animation.
