<!--
{
	"nav_order": 4
}
-->

# Account ID

An **Account ID** is a unique, persistent identifier that is generated when a user creates an account. Unlike a **username**, which can be changed at any time, the **Account ID** remains constant throughout the user's interaction with the system. This makes the Account ID a reliable and unalterable reference to a specific user, even if they change their username or other profile information.

```
account-id e9e6-4568-afcc-34c70b24a668
```

### Key Characteristics:

- **Unique and Persistent**: Each user is assigned a distinct Account ID that remains the same regardless of changes to their profile or username.
- **Immutable**: Once generated, the Account ID cannot be altered, ensuring that it remains a permanent and consistent identifier.
- **Separate from Username**: While a username is used for user-facing interactions and can be changed, the Account ID is primarily used for backend and system-level references, such as user data storage, transactions, and security purposes.

### Why It's Important:

- **Consistency**: The Account ID ensures that the system can reliably track and reference users, regardless of any modifications to their publicly visible information.
- **Security**: Because the Account ID is fixed and immutable, it reduces the risk of impersonation or data discrepancies if a username is changed.
- **System Integrity**: Account IDs are typically used in databases and external integrations to ensure that user data is correctly linked to the right individual, making them crucial for data integrity and user management.
