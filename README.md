14 Feb 25 - FixedOrderNumberIssue
4 Feb 25
# Project Documentation: User Role-based Workflow and Features

This document outlines the structure and workflow of the application. The application includes different user roles, a dynamic interface with various steps, and the ability to manage and track orders and products through a multi-step process. Below is the explanation of each component, their functions, and the detailed user flow.

## 1. User Roles

The application supports three types of users:
1. **Admin**: Has full access to all features, including viewing the burger menu for navigation.
2. **QA (Quality Assurance)**: Can view the instructions and sign them for approval but with specific actions on instructions.
3. **Operator**: Has access to operational features, including instruction signing and product-related tasks.

## 2. Login and Initial Workflow

- **Login Page**:
  - When the application is loaded, the user is prompted to log in. Depending on the credentials, the user is directed to their specific dashboard and interface. The login page serves as the entry point for the workflow.
  - Once logged in, the user will see the **Order Selection Page**.

### Order Selection Page
- **Order Selection**:
  - This page is visible to all users and is the first step in the workflow. Users select an order from the list of available orders.
  - Each order is color-coded to represent its status:
    - **Ongoing Orders**: Displayed with a specific color (e.g., light blue).
    - **Completed Orders**: Displayed with another color (e.g., green).
  - After selecting an order, the user moves to the **Product Selection Page**.

## 3. Product Selection
- **Product Selection Page**:
  - Once an order is selected, the user is directed to the Product Selection Page.
  - Products are color-coded based on their status (similar to the orders):
    - **Ongoing Products**: Displayed with a specific color.
    - **Completed Products**: Displayed with a different color.
  - The user can select a product, and the interface will navigate them to the **Instructions Page**.

## 4. Instructions Page

The Instructions Page provides step-by-step instructions for the selected product and order. It displays current instructions and provides navigation buttons for progressing through the steps.

### Features on Instructions Page:
- **"Go to Current Page" Button**:
  - Allows the user to return to the current page.
- **"Step Number" Button**:
  - Displays the step number that the user is currently working on.
- **Download Report**:
  - A button that allows the user to download a detailed report for the current product and instruction.
  - The report contains the following details:
    - User Name
    - User ID
    - Product Name
    - Instruction Language (based on the user's selected language)
    - Instruction with Steps (including comments and details for each step)

### Instruction Signing:
- The instructions include a **Sign Instruction** button:
  - For **Admin** and **Operator** users, the button will display "Sign and Next".
  - For **QA** users, the button will display "QA and Next".
  - Clicking the button allows the user to sign the instruction and move to the next step in the process.
- The instruction page is dynamically presented based on the user's role:
  - **Admin** and **Operator**: Both will have the "Sign and Next" button.
  - **QA**: Will see the "QA and Next" button to perform a quality check before moving to the next step.

## 5. User Management

The **User Profile Section** provides information about the logged-in user, including their role, username, and login ID.

### User Profile Features:
- **Role and Language**: Displays the role of the user (e.g., Admin, QA, or Operator) and the language they are using in the system.
- **Username and Login ID**: Shows the logged-in user’s username and unique login ID.
- **Logout Button**: Allows the user to log out of the system.
The User Profile Section is accessible to all users, and each user will see their profile based on their role.

## 6. Component Flow

Here is the detailed step-by-step workflow:
1. **Login Page**: The user logs in to the system.
   - Admin, QA, or Operator: Redirected to the Order Selection Page.
2. **Order Selection Page**:
   - The user selects an order.
   - Color-coded orders:
     - Ongoing orders are highlighted in a specific color.
     - Completed orders are highlighted in another color.
3. **Product Selection Page**:
   - After selecting an order, the user is redirected to the Product Selection Page.
   - Color-coded products:
     - Ongoing products are displayed in one color.
     - Completed products are displayed in a different color.
4. **Instruction Page**:
   - Once a product is selected, the user is directed to the Instruction Page.
   - Displays detailed instructions with each step.
   - The user can:
     - Navigate through instructions using "Sign and Next" (Admin/Operator) or "QA and Next" (QA).
     - Download a report for the current product and instructions, which includes the user’s details, product name, instruction language, and step-by-step instructions.
5. **User Profile**:
   - Users can view their role, language, and other personal information on the User Profile Section.
   - Includes an option to log out of the system.

## 7. Color Coding

Each user’s interaction with orders and products is visually represented through color coding:
- **Orders**:
  - Ongoing orders have one color (e.g., blue).
  - Completed orders have another color (e.g., green).
- **Products**:
  - Ongoing products have one color (e.g., yellow).
  - Completed products have a different color (e.g., gray).
This color-coding helps users quickly identify the status of both orders and products.
