# Neighborhood Map

This folder contains the necessary program files to generate Neighborhood map for bart locations.

## Contents

1. index.html
    * html file for the Neighborhood Map.
2. CSS/styles.css
    * styles for the Neighborhood Map webpage.
3. js/app.js
    * Java script file to populate the DOM elements with necessary data.
4. js/lib/
    * jquery.min.js
    * knockout-min.js
5. README.md

## Installation

This project can be run on a any browser including google chrome, mozilla firefox, safari.

1.Use the following command to clone the project repository.
        * ```git clone https://github.com/shilpamadini/NeighborhoodMap.git```
3. Run the following commands to install the required software.
    * Navigate to the "vagrant" directory where above mentioned software is downloaded.
    * To install the Linux VM. Run the following command.
        * ```vagrant up```
    * Once Vagrant up is finished running,run the following command to login to VM
        * ```vagrant ssh```
    * All the files in "vagrant" directory on your terminal will appear in the "/vagrant" directory on the VM
    *  At the VM shell prompt
        * ```cd /vagrant/catalog```
        * ```python database_setup.py```
        * ```python items_data.py```
        * ```python application.py```
        * ```\q``` to go back to shell prompt
    * Use any web browser to open the portfolio.html page.This webpage is tested on Google Chrome,Mozilla Firefox and Safari. This webpage is also tested for responsive design.

## Functionality

1. Webpage lists and displays San Francisco BART locations on Google Maps.
2. Filter through search option is provided where in a user enters the search string, displayed list is dynamically updated both on the list view and google maps markers.
3. Further more clicking a marker will provide info window which display real time departure info retrieved from Bart Api.
