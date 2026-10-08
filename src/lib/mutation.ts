export const LOGIN_MUTATION = `
    mutation Login($email: String!, $password: String!){
        login(input: {email: $email, password: $password}){
        success
        user {id email}
        errors {message code field}
        }
    }
`;

export const LOGOUT_MUTATION = `
    mutation Logout{
        logout { success }
    }
`;

// LOGIN_MUTATION	mutation	Log a user in
// LOGOUT_MUTATION	mutation	Log a user out

// A mutation changes something on the server (creates a session, deletes it, and so on).

// GraphQL operations have a signature too. It is the first line:

// graphql
// mutation Login($email: String!, $password: String!){
// Part	Meaning
// mutation	Operation type (changes data)
// Login	Operation name
// ( )	Holds the variable declarations (the inputs)
// $email: String!	Required text variable called email
// ,	Separates variables
// {	Starts the selection set (what you want back)

// Compare with query Me {: no parentheses, because ME_QUERY takes no inputs. It knows who "me" is from the cookie that gqlFetch sends.

// 4. Body, step by step
// LOGIN_MUTATION
// graphql
// login(input: {email: $email, password: $password}){
//     success
//     user {id email}
//     errors {message code field}
// }

// Read it inside-out:

// {email: $email, password: $password} builds an input object. The left names (email, password) are the backend's field names. The right side ($email, $password) are your variables.
// input: {...} passes that object as the argument called input.
// login(...) calls the login mutation on the server.
// Inside { } you choose what to get back:
// success is true or false.
// user {id email} is the logged-in user, with only two fields.
// errors {message code field} is a list of problems: what went wrong (message), a machine-readable label (code), and which input caused it (field).
// LOGOUT_MUTATION
// graphql
// mutation Logout{
//     logout { success }
// }

// No variables and no parentheses. It calls logout and asks only for success.

// EFFECTIVE_PERMISSION_QUERY

// Sends a userId and gets back codenames, likely a list of strings such as "users.view". The word "effective" suggests the backend has combined the user's permissions from all their roles.

// Weak spots and security notes:

// Plain strings have no checking. A typo like fullNme only fails at runtime. Tools like GraphQL Code Generator can check these against your schema and generate TypeScript types.
// Repeated field lists. id email appears in more than one place. A fragment could share it.
// isSuperuser on the frontend is for the UI only. Use it to show or hide buttons, but the backend must enforce every permission. Anyone can edit frontend code in the browser.
// Check permissions, not role names. effectivePermissions returning codenames fits that: the frontend should ask "does the user have users.view?" and never "is the user an admin?"
// effectivePermissions(userId:) takes a user id. The backend must confirm the caller may see that user's permissions. Otherwise anyone could look up anyone (an IDOR-style bug). For the current user, me could include the permissions and remove the need to pass an id.
// Password travels in the request body. That is normal, but it is safe only over HTTPS in production. Also never log the variables.
// The unknown: what me returns when nobody is logged in (null or an error) depends on your backend. Check the resolver.

// What I should remember
// Backticks make multi-line strings. Here the text inside is GraphQL, not TypeScript.
// Query reads, mutation changes. $name: Type! declares an input, and ! means required.
// The shape of a GraphQL response matches the shape of what you ask for.
// Never build query text by inserting user input. Send values through variables.
// Errors can come back in two places: top-level errors (which gqlFetch throws) and errors inside the result like login.errors (which you must check yourself).
