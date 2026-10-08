const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "http://localhost:8000";

export function resolveMediaUrl(
  url: string | null | undefined,
): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${MEDIA_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}


// Understanding resolveMediaUrl

// This is a utility/helper module. It has no UI. It takes a media path (like an image or uploaded file) and returns a full URL the browser can load.

// 1. What is it?
// Piece	Kind	Role
// MEDIA_BASE_URL	constant	The address of the server that holds uploaded files
// resolveMediaUrl	function	Turns a path like /media/avatar.png into a full URL

// The problem it solves: Django usually returns file paths as relative URLs, like /media/avatars/john.png. Your Next.js app runs on a different address (for example localhost:3000). If you put the relative path in <img src="/media/avatars/john.png">, the browser looks for it on the Next.js server, and the image is not there. It lives on the Django server (localhost:8000). This function adds the backend address in front.

// 2. How is it written?
// The constant
// ts
// const MEDIA_BASE_URL =
//   process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "http://localhost:8000";

// This is the same pattern as GRAPHQL_URL in your previous file:

// text
// process.env.NEXT_PUBLIC_MEDIA_BASE_URL   → read an environment variable
// ||                                        → "or" (use the right side if the left is empty)
// "http://localhost:8000"                  → the local fallback
// const MEDIA_BASE_URL =                   → store the result
// Symbols in the function
// | inside a type (string | null | undefined) is a union type. It means "one of these types."
// !url uses ! ("not"). It turns a value into its opposite truth value.
// /^https?:\/\//i is a regular expression (a pattern for matching text). More below.
// `...${...}` uses backticks. This is a template literal: text with JavaScript expressions inserted using ${ }.
// condition ? a : b is the ternary operator, a compact if/else that produces a value.
// 3. Signature
// ts
// export function resolveMediaUrl(
//   url: string | null | undefined,
// ): string | undefined {
// Part	Meaning
// export	Other files can import it
// function	Declares a function
// resolveMediaUrl	The name: "turn this into a usable media URL"
// ( )	Holds the parameters (fill-in-the-blank slots)
// url	The one parameter
// : string | null | undefined	Type annotation: the value may be text, null, or undefined
// trailing ,	Style only
// ): string | undefined	Return type: text, or undefined
// {	Start of the body

// Why not url?: string? The ? only allows the argument to be left out. It does not allow null. GraphQL fields that can be empty usually arrive as null, so null is written out explicitly.

// 4. Body, step by step
// Line 1: empty check
// ts
// if (!url) return undefined;
// !url is true when url is "falsy": null, undefined, or "" (empty string).
// If true, the function stops immediately with undefined. This is called an early return (or guard clause).
// No { } is used because the if has only one statement. That is legal for one-liners.
// Effect on UI: no image URL means no broken image. The caller can show a placeholder instead.
// Line 2: already a full URL?
// ts
// if (/^https?:\/\//i.test(url)) return url;

// Read it inside-out:

// text
// /^https?:\/\//i       → a regular expression
// .test(url)            → check whether url matches; gives true or false
// if (...) return url;  → if it matches, return it unchanged

// The regex, piece by piece:

// Part	Meaning
// / ... /	The slashes mark the start and end of the pattern
// ^	Must match at the start of the text
// http	The letters "http"
// s?	An optional "s" (so both http and https match)
// :	A colon
// \/\/	Two slashes. The \ "escapes" each one so it is not treated as the end of the pattern
// i (after the final /)	Case-insensitive, so HTTPS:// also matches

// So "https://cdn.example.com/a.png" matches and is returned as is. "/media/a.png" does not match, so the function continues.

// Line 3: build the full URL
// ts
// return `${MEDIA_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

// Three ${ } pieces are joined:

// ${MEDIA_BASE_URL} gives "http://localhost:8000".
// ${url.startsWith("/") ? "" : "/"} asks "does the path already begin with /?" If yes, add nothing (""). If no, add one /.
// ${url} gives the path.
// Input	Output
// "/media/a.png"	http://localhost:8000/media/a.png
// "media/a.png"	http://localhost:8000/media/a.png
// "https://x.com/a.png"	unchanged (line 2)
// null	undefined (line 1)

// The middle piece exists to avoid a double slash (8000//media) or a missing slash (8000media).

// 5. Why?
// One place to fix media addresses. In development the base is localhost:8000. In production it might be https://api.mysite.com or a storage/CDN address. Change one environment variable and every image follows.
// Handles both relative and absolute inputs. Some backends return full URLs (for example cloud storage), others return paths. This function accepts both.
// Returns undefined, not a broken string. Without the first guard, null would become "http://localhost:8000/null", a bad URL that produces a broken image.
// When not to use it: if your backend always returns absolute URLs, or you use a proxy/rewrite in next.config.js so /media/... reaches Django from the same origin, you do not need it.

// Weak spots worth noticing:

// Trailing slash in the env var. If MEDIA_BASE_URL is "http://x.com/", you get http://x.com//media/.... Many servers tolerate this, but it is untidy. Trimming trailing slashes would fix it.
// //cdn.com/a.png (a protocol-relative URL) starts with /, so it is treated as a path and gets the base URL added in front. That is wrong. It is rare, but it is an edge case.
// Security angle: any http(s) URL passes through untouched. If a user can control this value (for example a profile picture URL typed by the user), they could point it at an external server, which reveals visitors' IP addresses to that server. Other schemes, such as javascript:alert(1), do not match the regex, so they are treated as paths and become harmless text after the base URL. That is a nice accidental protection. But if you use next/image, remember it also requires external hosts to be listed in next.config (images.remotePatterns).
// NEXT_PUBLIC_ variables are baked in at build time. Changing the variable later requires a rebuild.
// 6. Connections
// text
// Django model (ImageField / FileField)
//         ↓ stores path: "avatars/john.png"
// GraphQL API returns "/media/avatars/john.png"
//         ↓
// gqlFetch(...)  → data.user.avatar
//         ↓
// resolveMediaUrl(data.user.avatar)
//         ↓
// "http://localhost:8000/media/avatars/john.png"
//         ↓
// <img src=... />  or  <AvatarImage src=... />  (shadcn/ui)
//         ↓
// Browser requests the file from Django (or your storage service)
// .env.local sets NEXT_PUBLIC_MEDIA_BASE_URL.
// It pairs naturally with gqlUpload from your last file: upload a file with gqlUpload, then display it with resolveMediaUrl.
// Missing context: to see what the backend actually returns for file fields (relative or absolute), check your Django settings (MEDIA_URL) and your GraphQL type for the file field.
// 7. Advanced concepts

// Union types. string | null | undefined means the value is one of three things. TypeScript forces you to handle each case before using it as a string. The if (!url) return line does this. After it, TypeScript knows that url is a string. This is called type narrowing.

// Regular expressions. A regex is a mini-language for describing text patterns. .test() is the simplest use: "does the text match, yes or no?"

// Truthy and falsy. In JavaScript, if (value) treats "", 0, null, undefined, and false as "no." Everything else counts as "yes."

// 8. Small example
// tsx
// <img src={resolveMediaUrl(user.avatar)} alt={user.name} />

// If user.avatar is "/media/me.png", the browser gets http://localhost:8000/media/me.png. If it is null, src becomes undefined, and React simply leaves the attribute out.

// 9. Reading pattern
// text
// 1. Main verb?       → "converts a path into a full URL"
// 2. Input?           → url (maybe empty)
// 3. Read the guards  → each `if ... return` is an exit door:
//                       exit 1: empty → undefined
//                       exit 2: already full → unchanged
//                       final:  build and return
// 4. Template literal → read each ${ } separately, then join the results
// 5. Ternary          → read as: "if this, then A, otherwise B"

// Pattern to reuse (guard-clause function): handle the special cases first with early returns, then do the normal work at the end.

// To write something like this yourself:

// Say the goal in one sentence.
// List the possible inputs (empty, full URL, path with slash, path without).
// Write one early return per special case.
// Write the normal case last.
// Type the input and output.
// Test each input from your list.
// 10. What I should remember
// A | B in a type means "either A or B." Handle each possibility before using the value.
// if (!x) return ...; is a guard clause: deal with bad or empty input first and exit early.
// Backticks with ${ } build strings from values. cond ? a : b picks one of two values.
// Relative paths from a backend need a base URL when the frontend runs on a different origin.
// NEXT_PUBLIC_ env variables are public and fixed at build time, so never put secrets in them.