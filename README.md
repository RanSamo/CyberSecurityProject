What I have done in the last push:

Backend:
- Removed username and ensured we only use email for user authentication.
- Added `user_id` as a foreign key to the `customers` table.
- Updated customer model to filter operations by `user_id`.
- Ensured each user can only access their own customers.
  
Tests performed using Postman:
1. Register a new user
2. Login as the user
3. Add a customer
4. Get all customers for the logged-in user
5. Get customer by ID
6. Search customer by last name
7. Update customer
8. Delete customer
9. Attempt to access a customer that doesn’t belong to the user

All of the tests passed successfully.

Work in progress:
SQL Injection and the xss attack are not fully implemented. 
