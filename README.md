# rooftop-media.org


## Project set up:

### Repo set up

1. Clone this repo to your local computer.
1. Enter the repo with a terminal.
1. Run `npm install`
1. Run `node ./server/server.js` to start the server.

### Database set up

1. Install MySql.  For Ubuntu, use this: https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04
1. Set up a password for the Root user by running `ALTER USER 'root'@'localhost' IDENTIFIED BY 'password123';`
1. Set up the database and RTM user by running ` mysql -u root -p -e "source .\server\database\db_setup.sql"`