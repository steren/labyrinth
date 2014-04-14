[Labyrinth](steren.fr/labyrinth)
=========

Simple maze generator. 
Only support rectangular mazes. Uses a custom algorithm 

Usage
-----

Resize the window to create a new maze with a new size.

Roadmap
------------

* Create a SVG+CSS renderer to be resolution independent.
* Add printing (easier using SVG)
* Allow user to draw his path from the start point to the end. Use Touch Events and mouse as input.
* Use Web Workers for maze creation.
* Add a mode to visualize the growing of the algorithm (was done before pretty badly), use a custom color scheme for each frame instead of stopping the algorithm.

Easter egg
----------

Add [`#colors`](steren.fr/labyrinth#colors) to the end of the URL for a visual surprise (be patient, it can take dome time to render).

For developers
--------------

### `labyrinth.js` is a maze generator

You pass it parameters to erase the default ones. Most notably: size and starting point.

### `labyrinth-canvas-renderer.js` is a renderer for generated maze

You pass it parameters to render the maze, most notably: square colors and size.
You can specify a custom color scheme with the `colorScheme` parameter.
