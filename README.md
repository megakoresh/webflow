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

This application is built using [Sails](http://sailsjs.org) v0.11.0
