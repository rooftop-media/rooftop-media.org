# A free CMS and LMS platform

This project relies only on NodeJS, with no other dependencies.  There is a tutorial on how to recreate this website step-by-step [here](https://github.com/rooftop-media/rooftop-media.org-tutorial). 

The website is not live while it's being built. 

<img src="https://raw.githubusercontent.com/rooftop-media/rooftop-media.org/refs/heads/master/assets/landing.png" width="800"/>


## Project set up:

### Repo set up

1. Clone this repo to your local computer.
1. Enter the repo with a terminal.
1. Run `node ./server/server.js` to start the server.

### Database set up

I am using a custom database for this project, made in Node. 

In the future, security measures will be added, and it will be necessary to create an admin username and password to manage the database. 
<!--1. Install MySql.  For Ubuntu, use this: https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04
1. Set up a password for the Root user by running `ALTER USER 'root'@'localhost' IDENTIFIED BY 'password123';`
1. Set up the database and RTM user by running ` mysql -u root -p -e "source .\server\database\db_setup.sql"`-->
