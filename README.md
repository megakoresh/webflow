# Sanbox
Here I test functionality of Sails and do a lot of prototyping... Nothing to see here!

##For the teacher
####Files I modified:
  - api
    - models
      - Node.js
      - Chart.js
    - controllers
      - **NodeController.js** (main backend logic)
      - ChartController.js (thats more of a stub for now)
  -  assets
    - js
      - public
        - **routing.js** (the main frontend meat of the app)
        - ui.js (I planned to separate UI into separate file, but I have to delay it, because I am not very good with namespacing yet)
        - signup (all of it, but it's not related to this project)
    - paperscript
      - flowchart.js (this is my old attempt before I found JointJS. I recommend you look at it anyway.)
    - styles
      - **mystyle.scss** (naturally)
  - views
    - layout.ejs (this project has multiple components and I don't want them piling up so I use a templating engine for markup. The reason why off-canvas appears on all pages is simply because I havent yet figured out how to run a current view check in EJS).
    - common (just the common elements)
    - **flowchart.js** (the main markup file)
    - signup.ejs (not related)
    - panel.ejs (not related)

+ A metric ton of settings in sails to get it all to work together.

###Other resources used
  + JointJS - used for SVG rendering and interaction
  + jQuery - used for everything. Too bad it can't be used for love.
  + Bootstrap - basically an inferior version of Foundation
  + Jasny Bootstrap extension - adding a little more of Foundation functionality to Boostrap
  + Underscore.js - you mean you can code without it?! How?
  + Angular - not for this project
  + Angular-toastr - not for this project
  + jQuery UI - for one single function (color animations)
  + jQuery mobile - for one single event (orientation change)
  + Hammer.js - for failed attempt to add proper touch support
  + Paper.js - for my own API before discovery of JointJS that I spent 2 months writing only to find out that all I did was done in a very similar way by JointJS on with SVG instead of canvas. So much for that. But Paper.js is still great.
  + Sails.js - the best kid around (at least on Node playground). If only it had good learning materials and was googlable...

Sails has this tendency to make you use all the frameworks and libraries ever, because it compiles them automagically. Just drop the file into folder and it will be added to all your necessary pages, and later Grunt will compress and minify them all into single file for production.
This application is built using [Sails](http://sailsjs.org) v0.11.0
