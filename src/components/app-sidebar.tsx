// components/app-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { resolveMediaUrl } from "@/lib/media";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package,
  FolderTree,
  ClipboardList,
  Users,
  Shield,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
import { useCompanyLogo } from "@/lib/use-company-logo";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: ClipboardList },
  {
    href: "/dashboard/users",
    label: "Users",
    icon: Users,
    superuserOnly: true,
  },
  {
    href: "/dashboard/products",
    label: "Products",
    icon: Package,
    permission: "products.view_product",
  },
  {
    href: "/dashboard/staff",
    label: "Staff",
    icon: Users,
    superuserOnly: true,
  },
  {
    href: "/dashboard/roles",
    label: "Roles",
    icon: Shield,
    superuserOnly: true,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAuth();
  const router = useRouter();
  const { company, activeLogo } = useCompanyLogo();

  const visibleLinks = links.filter((link) => {
    if (link.superuserOnly) return !!user?.isSuperuser;
    if (link.permission) return hasPermission(link.permission);
    return true;
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
                <>
                  <Avatar className="h-7 w-7 shrink-0 rounded-md">
                    <AvatarImage
                      src={resolveMediaUrl(activeLogo?.url)}
                      alt={company?.name ?? "Company"}
                    />
                    <AvatarFallback className="rounded-md">
                      {(company?.name ?? "C").slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-semibold">
                      {company?.name ?? "Company"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>

                  <ChevronsUpDown className="ml-auto size-4 opacity-60" />
                </>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <div className="px-2 py-1.5 font-medium">{company?.name}</div>
                <div className="px-2 pb-2 text-xs text-muted-foreground">
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
                {user?.isSuperuser && (
                  <DropdownMenuItem
                    render={<Link href="/dashboard/settings/company" />}
                  >
                    Company settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  render={<Link href="/dashboard/settings/change-password" />}
                >
                  Change password
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/dashboard/settings/profile" />}
                >
                  My profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await logout();
                    router.push("/login");
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleLinks.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    render={<Link href={href} />}
                    isActive={pathname === href}
                    tooltip={label}
                  >
                    <>
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}


// The main purpose: This code decides which navigation links a user is allowed to see. It checks each link and keeps or removes it based on the user's role and permissions.

// For example, your sidebar might contain:

// Dashboard

// Users

// Company Settings

// Admin Panel

// Not every user should necessarily see every link.

// 1. First, understand filter()

// Let's start with this part:

// const visibleLinks = links.filter(...)

// Imagine links is an array:

// const links = [
//   { name: "Dashboard" },
//   { name: "Users" },
//   { name: "Admin Panel" },
// ];

// An array is a list of items. In this case, each item represents a navigation link.

// JavaScript's .filter() goes through the array, one item at a time, and checks whether each item should be kept.

// If the check returns true, the item stays.

// If the check returns false, the item is removed from the resulting array.

// For example:

// const numbers = [1, 2, 3, 4, 5];

// const evenNumbers = numbers.filter((number) => {
//   return number % 2 === 0;
// });

// The result is:

// [2, 4]

// Why? Because only 2 and 4 pass the test.

// The same idea applies to your navigation links: keep the links that pass the access checks.

// 2. What does (link) => { ... } mean?

// Look at the beginning:

// links.filter((link) => {

// There are three parts:

// filter is the array method that checks every item.

// link is the parameter representing the current item being checked.

// => defines an arrow function — the instructions JavaScript should execute for each item.

// Imagine the array contains three links:

// [
//   { name: "Dashboard" },
//   { name: "Users" },
//   { name: "Admin Panel" },
// ]

// JavaScript effectively performs the check three times:

// Check

	

// Value of link




// First time

	

// { name: "Dashboard" }




// Second time

	

// { name: "Users" }




// Third time

	

// { name: "Admin Panel" }

// Each time, your function decides whether that particular link should remain in visibleLinks.

// 3. First condition: superuserOnly
// if (link.superuserOnly) return !!user?.isSuperuser;

// Let's read it from the outside inward.

// Part A: link.superuserOnly

// This accesses the superuserOnly property of the current link.

// For example:

// {
//   name: "Admin Panel",
//   superuserOnly: true
// }

// Here:

// link.superuserOnly

// evaluates to true.

// The condition:

// if (link.superuserOnly)

// means: "If this link is marked as available only to superusers, execute the next statement."

// Part B: user?.isSuperuser

// You get user from your authentication provider:

// const { user } = useAuth();

// Your User type includes:

// isSuperuser: boolean;

// That means isSuperuser should be either true or false when a user object exists.

// The expression:

// user?.isSuperuser

// means:

// If user exists, read its isSuperuser property.

// If user is null or undefined, return undefined instead of throwing an error.

// Part C: !!

// This is called double negation. It converts a value into a boolean (true or false).

// For example:

// Expression

	

// Result




// !!true

	

// true




// !!false

	

// false




// !!undefined

	

// false




// !!null

	

// false

// Therefore:

// return !!user?.isSuperuser;

// means: "Return true if the user is a superuser; otherwise, return false."

// In plain English: If a link is restricted to superusers, keep it only when the current user is a superuser.

// 4. Second condition: permission
// if (link.permission) return hasPermission(link.permission);

// This handles links that require a specific permission.

// Imagine a link is defined like this:

// {
//   name: "Users",
//   permission: "view_users"
// }

// The expression:

// link.permission

// retrieves the string:

// "view_users"

// Then:

// hasPermission(link.permission)

// is equivalent to:

// hasPermission("view_users")

// Remember your authentication provider's function:

// const hasPermission = (codename: string) =>
//   !!user?.isSuperuser || permissions.includes(codename);

// It returns true if either:

// The user is a superuser, or

// The user's permissions include the requested codename.

// For example, if:

// permissions = ["view_users", "view_dashboard"];

// then:

// hasPermission("view_users"); // true
// hasPermission("delete_users"); // false

// Assuming the user is not a superuser, the first permission exists in the array, but the second does not.

// In plain English: If a link specifies a permission, keep it only if hasPermission() approves it.

// 5. Final statement: return true
// return true;

// This runs when neither of the previous conditions returns a result.

// Imagine a link looks like this:

// {
//   name: "Help"
// }

// It has neither superuserOnly nor permission.

// The function reaches:

// return true;

// That tells .filter() to keep the link.

// In plain English: If a link has no special access restriction, show it by default.

// This assumes the link is already present in the links array.

// 6. Put everything together

// Here is the entire decision process:

// Start: Check one link

// link is the current array item.

// Does link.superuserOnly exist as a truthy value?

// Yes

// Return !!user?.isSuperuser and finish checking this link.

// No

// Continue to the permission check.

// Does link.permission exist as a truthy value?

// Yes

// Return hasPermission(link.permission) and finish checking this link.

// No

// Continue to return true.

// return true

// Keep the unrestricted link.

// One important detail: return immediately ends the callback for the current link. If the superuser check runs, JavaScript does not continue to the permission check for that same link.

// 7. Let's test your understanding

// Suppose you have these links:

// const links = [
//   { name: "Dashboard" },
//   { name: "Users", permission: "view_users" },
//   { name: "Admin", superuserOnly: true },
// ];

// And the current user has:

// user = {
//   isSuperuser: false,
//   // Other user properties...
// };

// permissions = ["view_users"];

// The resulting visibleLinks contains:

// Link

	

// Reason

	

// Kept?




// Dashboard

	

// No restriction

	

// Yes




// Users

	

// User has view_users

	

// Yes




// Admin

	

// User is not a superuser

	

// No

// So the result contains Dashboard and Users, but not Admin.

// One final note: these checks control which links appear in the UI. Your backend must still enforce permissions when someone attempts to access protected data or perform a protected action.


// Let's understand this code step by step using simple English. We'll start with the big picture, then break down each part, and finally see how everything works together.

// 1. What does this code do?

// This code creates the links you see inside a sidebar menu in your application.

// For example, imagine your sidebar looks like this:

// Dashboard

// Users

// Settings

// Your code takes a list of links and creates a menu item for each link, including its icon, text, destination, and active state.

// 2. Understand the structure first

// Here is the code with its main sections identified:


// <SidebarContent>
//   <SidebarGroup>
//     <SidebarGroupContent>
//       <SidebarMenu>
//         {visibleLinks.map(({ href, label, icon: Icon }) => (
//           <SidebarMenuItem key={href}>
//             <SidebarMenuButton
//               render={<Link href={href} />}
//               isActive={pathname === href}
//               tooltip={label}
//             >
//               <>
//                 <Icon className="h-4 w-4" />
//                 <span>{label}</span>
//               </>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         ))}
//       </SidebarMenu>
//     </SidebarGroupContent>
//   </SidebarGroup>
// </SidebarContent>

// Think of the components as containers inside containers:

// SidebarContent

// The entire sidebar content area

// SidebarGroup

// Groups related sidebar items

// SidebarGroupContent → SidebarMenu

// Contains the menu and its links

// SidebarMenuItem → SidebarMenuButton

// One clickable menu link

// The important idea is that each outer component contains the component inside it. The code uses nested components to organize the sidebar.

// 3. Understand every important part
// Part 1: <SidebarContent>
// <SidebarContent>
//   ...
// </SidebarContent>

// SidebarContent is a React component provided by your sidebar UI library.

// The opening tag <SidebarContent> starts the component.

// The closing tag </SidebarContent> ends it.

// The code between them becomes its contents, also called its children.

// Think of it as the main container for the sidebar's content.

// Part 2: The grouping components
// <SidebarGroup>
//   <SidebarGroupContent>
//     <SidebarMenu>
//       ...
//     </SidebarMenu>
//   </SidebarGroupContent>
// </SidebarGroup>

// These components organize the menu.

// Component

	

// Simple meaning




// SidebarGroup

	

// Creates a group of sidebar items.




// SidebarGroupContent

	

// Holds the content belonging to that group.




// SidebarMenu

	

// Holds the individual menu items.

// They don't create the link data themselves. They provide the structure in which the links are displayed.

// Part 3: visibleLinks.map(...)

// This is one of the most important parts of the code.

// {visibleLinks.map(({ href, label, icon: Icon }) => (
//   ...
// ))}

// Let's break it down.

// A. What is visibleLinks?

// visibleLinks is a variable containing an array of link objects. It might look like this:

// const visibleLinks = [
//   {
//     href: "/dashboard",
//     label: "Dashboard",
//     icon: LayoutDashboard,
//   },
//   {
//     href: "/users",
//     label: "Users",
//     icon: Users,
//   },
// ];

// Each object describes one menu item.

// href — where the link should go.

// label — the text displayed to the user.

// icon — the React component used as the icon.

// These are example values to help you understand the code.

// B. What does .map() mean?

// .map() goes through an array and produces a new result for every item.

// Imagine visibleLinks contains three objects:

// visibleLinks.map(...)

// React runs the callback once for each object and uses the returned JSX to display three menu items.

// Array: visibleLinks

// Dashboard

// Users

// Settings

// One array item becomes one rendered menu item.

// Without .map(), you might have to write the JSX for every menu item manually. Using .map() lets you generate them from data.

// C. Why are there curly braces {}?
// {visibleLinks.map(...)}

// In JSX, curly braces allow you to insert a JavaScript expression into the markup.

// For example:

// <p>{2 + 3}</p>

// React evaluates 2 + 3 and displays 5.

// Similarly, React evaluates visibleLinks.map(...) and displays the menu items it produces.

// D. What does ({ href, label, icon: Icon }) mean?

// This part uses object destructuring.

// Suppose one object is:

// {
//   href: "/users",
//   label: "Users",
//   icon: Users
// }

// Instead of writing:

// link.href
// link.label
// link.icon

// you can extract the values directly:

// ({ href, label, icon: Icon })

// The special part is icon: Icon.

// It means:

// Read the object's property named icon.

// Store its value in a local variable named Icon.

// For example, if icon contains the Users component, then Icon refers to that component.

// Important: icon: Icon does not mean the value is being changed. It is simply being given a different variable name.

// Why use a capital I? React treats capitalized JSX names as custom components, so you can write <Icon />.

// E. Why is there an arrow =>?
// visibleLinks.map(({ href, label, icon: Icon }) => (
//   ...
// ))

// The => defines an arrow function.

// You can read the expression as:

// For each link object, take out its href, label, and icon, then return the JSX for that menu item.

// The parentheses around the JSX allow the arrow function to return multiple nested JSX elements as one result.

// 4. Understand one menu item

// Now let's look inside .map().

// <SidebarMenuItem key={href}>
//   <SidebarMenuButton
//     render={<Link href={href} />}
//     isActive={pathname === href}
//     tooltip={label}
//   >
//     <>
//       <Icon className="h-4 w-4" />
//       <span>{label}</span>
//     </>
//   </SidebarMenuButton>
// </SidebarMenuItem>

// This code creates one menu item. Let's break it down further.

// A. key={href}
// <SidebarMenuItem key={href}>

// React needs a way to identify individual items when it renders lists.

// key provides that identity.

// For example:

// key="/dashboard"
// key="/users"

// If each link has a unique href, that can serve as its key.

// The key is for React's internal tracking; it is not displayed as text in the sidebar.

// B. render={<Link href={href} />}
// render={<Link href={href} />}

// This tells SidebarMenuButton to render using a Link component.

// In Next.js, Link is used for navigation between pages.

// For example:

// <Link href="/users" />

// The link's destination is /users.

// But in your code:

// <Link href={href} />

// href is a variable. Its value changes for each object in visibleLinks.

// So if the current object has href: "/users", the rendered link uses /users.

// Why render? The sidebar button component supports using a different element for its rendered output. Here, that element is the Next.js Link. This lets the menu item behave as a navigation link rather than just an ordinary button.

// C. isActive={pathname === href}
// isActive={pathname === href}

// This determines whether the current menu item should be marked as active.

// Let's explain the pieces:

// pathname — the current URL path, commonly obtained using Next.js's usePathname().

// href — the destination of this menu item.

// === — checks whether two values are strictly equal.

// Suppose:

// pathname = "/users";
// href = "/users";

// Then:

// pathname === href

// evaluates to:

// true

// The menu item is marked active.

// But if:

// pathname = "/users";
// href = "/dashboard";

// the result is false.

// Current pathname

	

// Menu item's href

	

// isActive




// /users

	

// /users

	

// true




// /users

	

// /dashboard

	

// false




// /dashboard

	

// /dashboard

	

// true

// The sidebar component can use this value to style the active item differently.

// Note that this is an exact path comparison. A nested path such as /users/123 will not exactly match /users.

// D. tooltip={label}
// tooltip={label}

// A tooltip is a small label that can appear when a user hovers over an item.

// If label is "Users", the tooltip receives "Users".

// This is particularly useful when the sidebar is collapsed and the text labels are hidden.

// E. The fragment <>...</>
// <>
//   <Icon className="h-4 w-4" />
//   <span>{label}</span>
// </>

// This is a React Fragment.

// A fragment groups multiple JSX elements without introducing an extra HTML element around them.

// Here, it groups the icon and the text together.

// You can think of it as saying:

// Put these two things inside the menu button, but don't add another wrapper element.

// F. <Icon className="h-4 w-4" />
// <Icon className="h-4 w-4" />

// This displays the icon associated with the current link.

// Remember the destructuring from earlier:

// icon: Icon

// That is why Icon can be used as a component here.

// The className prop contains CSS utility classes, commonly from Tailwind CSS:

// h-4 — sets the height to 1rem (typically 16 pixels).

// w-4 — sets the width to 1rem (typically 16 pixels).

// So the icon is given a size of approximately 16 × 16 pixels.

// G. <span>{label}</span>
// <span>{label}</span>

// A span is an HTML element commonly used to group inline text.

// The curly braces insert the value of the label variable.

// If:

// label = "Users";

// then React displays:

// <span>Users</span>

// You don't need to write a separate menu item for "Dashboard", "Users", or "Settings" because the label comes from the current object.

// 5. Follow one link from beginning to end

// Let's pretend this is one of your link objects:

// {
//   href: "/users",
//   label: "Users",
//   icon: Users
// }

// Here's what happens:

// .map() picks the object. It processes the object describing the Users page.

// Destructuring extracts its values. href becomes "/users", label becomes "Users", and Icon becomes the Users icon component.

// SidebarMenuItem is created. Its React key is "/users".

// SidebarMenuButton is configured. Its rendered element uses <Link href="/users" />, its active state is calculated, and its tooltip receives "Users".

// The contents are rendered. The Users icon appears beside the text "Users".

// The user clicks the link. Next.js navigates to the /users page.

// 6. A simpler version to help you learn

// You can understand the core idea with this smaller example first:

// const links = [
//   { href: "/users", label: "Users" },
//   { href: "/settings", label: "Settings" },
// ];

// return (
//   <ul>
//     {links.map((link) => (
//       <li key={link.href}>
//         <Link href={link.href}>
//           {link.label}
//         </Link>
//       </li>
//     ))}
//   </ul>
// );

// Read this in plain English:

// links contains the menu data.

// .map() processes each link.

// link.href gives the destination.

// link.label gives the text.

// key={link.href} helps React track each list item.

// <Link> makes the item a navigation link.

// Your original code does the same basic job, but adds reusable sidebar components, icons, tooltips, and active-state styling.

// 7. A repeatable method for reading React code

// When you encounter code like this in your project, read it in this order:

// Find the data: Where does visibleLinks come from? What does each object contain?

// Find the loop: What does .map() repeat?

// Find the output: What JSX does the arrow function return?

// Find the behavior: What do href, isActive, and tooltip control?

// Find the appearance: What do Icon, span, and className display or style?

// You don't need to understand every nested component at once. First understand what data enters the code, how that data is processed, and what the code produces.

// The main idea: visibleLinks supplies the information, .map() turns each object into a menu item, and the sidebar components determine how each item looks and behaves.