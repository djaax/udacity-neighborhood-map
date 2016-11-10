# Udactiy Neighborhood Map

## Intro
This is a neighborhood map to show my favorite venues to visit in Münster, Germany. It's frontend only, built with Knockout.js. It uses the Google Maps API and the Foursquare API to display venues on a map.

## Run the application
To run this application locally, use python to create a simple http server to static files. Navigate into the directory and run ```python -m SimpleHTTPServer 5000```. Then, open a webbrowser and type in "localhost:5000".

## Usage
You'll find a list of venues on the left of the window. Click a list item to see its location on the map with some details. You can also click a marker on the map to get more details. Additionally, you can search all venues which are then filtered on the map. This also works on mobile devices as the layout is adaptive.