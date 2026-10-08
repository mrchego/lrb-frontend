export const ME_QUERY = `
    query Me {
        me {
            id email firstName lastName fullName phone
            avatar {url name}
            isSuperuser 
            company {id name}
        }
    }
`;

export const EFFECTIVE_PERMISSION_QUERY = `
    query EffectivePermissions($userId: ID!){
        effectivePermissions(userId: $userId){
            codenames
        }
    }
`;

export const COMPANY_QUERY = `
  query Company {
    company {
      id name email phone country city address
      logoLight { url name }
      logoDark { url name }
      isActive
    }
  }
`;

export const COMPANY_SETTINGS_QUERY = `
  query CompanySettings {
    companySettings {
      id timezone currency language dateFormat theme
    }
  }
`;

// 1. What is it?
// Constant	GraphQL kind	Role
// ME_QUERY	query	Get the currently logged-in user
// EFFECTIVE_PERMISSION_QUERY	query	Get the permission codenames a user has

// A query reads data and changes nothing.

// Key words:

// export lets other files import it.
// const creates a constant (a name that cannot be reassigned).
// The backticks ` create a template literal, a string that can span many lines. There is no ${} inside these, so they are just long text. TypeScript sees them as string, and the GraphQL server reads that text later.
// 2. How is it written?

// You are reading two languages here. The outside is TypeScript (export const X = ...). The inside of the backticks is GraphQL, which has its own syntax.

// TypeScript layer
// text
// export const ME_QUERY = `...`;
//   ↓        ↓       ↓      ↓
// share   constant  name   the text (right side is a string)
// GraphQL layer, using ME_QUERY
// graphql
// query Me {
//     me {
//         id email firstName lastName fullName phone
//         avatar {url name}
//         isSuperuser
//         company {id name}
//     }
// }
// Symbol	Meaning
// query	The operation type: "I want to read data"
// Me	The operation's name, chosen by you. It helps with debugging and logs
// { }	A selection set: "give me these fields"
// me	A field on the server's root query. It returns the current user
// id email firstName ...	Fields listed with spaces. GraphQL does not need commas between fields
// avatar {url name}	avatar is an object, so you must choose which of its inner fields you want

// Reading rule: in GraphQL, you only receive the fields you list. If phone is not listed, it is not returned. The shape of the answer matches the shape of the request.

// Variables and arguments
// graphql
// query EffectivePermissions($userId: ID!){
//     effectivePermissions(userId: $userId){
//         codenames
//     }
// }
// Part	Meaning
// ($userId: ID!)	Declares a variable: a fill-in-the-blank slot for this operation
// $	Marks a variable name
// :	Separates name from type
// ID	GraphQL's built-in type for identifiers
// !	Non-null: required, cannot be missing or null
// effectivePermissions(userId: $userId)	Calls a field with an argument. Left userId is the argument name the backend defined. Right $userId is your variable

// Declaring ($userId: ID! at the top) and using (userId: $userId below) are two separate steps.
