
# API and Socket Documentation

This document provides a summary of the API endpoints and Socket.IO implementation for the chatbot application.

## Socket.IO

The Socket.IO server is initialized at `/api/socket`. It handles real-time communication between the client and the server.

### Rooms

-   `website_{websiteId}`: A room for all users (admins and visitors) of a specific website.
-   `admin_{websiteId}`: A room for all admins of a specific website.
-   `visitor_{visitorId}`: A room for a specific visitor.

### Events

-   **`connection`**: When a client connects, they are joined to the appropriate rooms. If an admin connects, an `agent-status-changed` event is emitted.
-   **`visitor-message`**: When a visitor sends a message, it's handled by `handleVisitorMessage`, which saves the message, notifies admins, and triggers an AI response if enabled.
-   **`visitor-away`**: Sets the visitor's status to 'away'.
-   **`admin-message`**: When an admin sends a message, it's handled by `handleAdminMessage`, which saves the message and broadcasts it to the visitor.
-   **`admin-typing` / `admin-stop-typing`**: Forwards typing indicators to the visitor.
-   **`check-agent-status`**: Checks if any admins are online and emits an `agent-status-changed` event.
-   **`disconnect`**: When a client disconnects, they are removed from the rooms. If an admin disconnects, an `agent-status-changed` event may be emitted.
-   **`update-ai-state`**: Updates the AI state for a website and emits an `ai-state-changed` event.

## API Endpoints

### Admin

-   `/api/admin/add-dashboard-stats` (POST): Updates dashboard statistics.
-   `/api/admin/add-feature-subscriptionType` (POST): Adds a feature to a subscription type.
-   `/api/admin/add-footer-link` (POST): Adds a footer link.
-   `/api/admin/add-social-link` (POST): Adds a social media link.
-   `/api/admin/cancel-user-subscription` (POST): Cancels a user's subscription.
-   `/api/admin/check-admin` (GET): Checks if the current user is an admin.
-   `/api/admin/create-page` (POST): Creates a new page.
-   `/api/admin/create-subscription` (POST): Creates a new subscription type.
-   `/api/admin/create-widget-settings-table` (POST): Creates the `widget_settings` table in the database.
-   `/api/admin/delete-page` (DELETE): Deletes a page.
-   `/api/admin/edit-feature-subscriptionType` (POST): Edits a subscription feature.
-   `/api/admin/edit-status-subscription-type` (POST): Edits the status of a subscription type.
-   `/api/admin/edit-subscription-type` (POST): Edits a subscription type.
-   `/api/admin/edit-user-subscription` (POST): Edits a user's subscription.
-   `/api/admin/edit-user` (POST): Edits a user's information.
-   `/api/admin/get-newsletter-emails` (GET): Retrieves a paginated list of newsletter subscribers.
-   `/api/admin/get-subscription-limits` (GET): Retrieves subscription limits.
-   `/api/admin/get-subscription-types` (GET): Retrieves subscription types.
-   `/api/admin/get-subscriptions-active-count` (GET): Retrieves the count of active subscriptions.
-   `/api/admin/get-subscriptions-types` (GET): Retrieves all subscription types with details.
-   `/api/admin/get-total-tickets-count` (GET): Retrieves the total number of tickets.
-   `/api/admin/get-user-email` (GET): Retrieves a user's email by ID.
-   `/api/admin/get-user-subscription` (GET): Retrieves a user's subscription.
-   `/api/admin/get-user` (GET): Retrieves a user by email.
-   `/api/admin/get-users-tickets` (GET): Retrieves tickets from registered users.
-   `/api/admin/get-visitors-tickets` (GET): Retrieves tickets from visitors.
-   `/api/admin/mark-ticket-read` (POST): Marks a ticket as read.
-   `/api/admin/remove-footer-link` (DELETE): Removes a footer link.
-   `/api/admin/remove-newsletter-email` (DELETE): Removes a newsletter subscriber.
-   `/api/admin/remove-social-link` (DELETE): Removes a social media link.
-   `/api/admin/remove-subscription-feature` (POST): Removes a subscription feature.
-   `/api/admin/remove-subscription-type` (POST): Removes a subscription type.
-   `/api/admin/resolve-ticket` (POST): Resolves a ticket.
-   `/api/admin/respond-ticket` (POST): Responds to a ticket.
-   `/api/admin/search-subscription` (POST): Searches for subscriptions.
-   `/api/admin/search-ticket-by-email` (POST): Searches for a ticket by email.
-   `/api/admin/send-notification` (POST): Sends a notification to a user.
-   `/api/admin/set-general-settings` (POST): Sets general application settings.
-   `/api/admin/subscriptions-per-page` (POST): Retrieves a paginated list of subscriptions.
-   `/api/admin/total-subscriptions` (GET): Retrieves the total number of subscriptions.
-   `/api/admin/total-users` (GET): Retrieves user statistics.
-   `/api/admin/update-subscription-limits` (POST): Updates subscription limits.
-   `/api/admin/upload-logo` (POST): Uploads a new logo.
-   `/api/admin/users-per-page` (GET): Retrieves a paginated list of users.

### Auth

-   `/api/auth/logout` (POST): Logs out the user and disconnects their admin sockets.

### Billing

-   `/api/billing` (GET): Retrieves billing information for a user.

### Chat

-   `/api/chat/conversation` (GET): Retrieves the conversation history for a visitor.
-   `/api/chat/conversation` (POST): Saves a new message to a conversation.
-   `/api/chat/history` (GET): Retrieves the chat history for a website.

### Debug

-   `/api/debug/widget-debug` (GET): Retrieves debugging information for widget settings.

### FA

-   `/api/fa/[websiteId]` (GET): Retrieves popups for a specific path on a website.

### Geolocation

-   `/api/geolocation/ip-lookup` (POST): Retrieves geolocation information for an IP address.

### Install

-   `/api/install/check-clerk` (GET): Checks Clerk configuration.
-   `/api/install/check-database-permissions` (GET): Checks database permissions.
-   `/api/install/check-database-status` (GET): Checks if the database is installed.
-   `/api/install/check-database` (GET): Checks the database connection.
-   `/api/install/check-env` (GET): Checks environment variables.
-   `/api/install/create-tables` (POST): Creates database tables.
-   `/api/install/save-metadata` (POST): Saves initial application metadata.

### Public

-   `/api/public/check-ai-limits` (POST): Checks if a website is within its AI response limits.
-   `/api/public/check-eligible-limits` (POST): Checks if a website is within its conversation and AI limits.
-   `/api/public/check-user-admin` (GET): Checks if the current user is an admin.
-   `/api/public/get-footer-links` (GET): Retrieves footer links.
-   `/api/public/get-general-settings` (GET): Retrieves general application settings.
-   `/api/public/get-pages-names` (GET): Retrieves the names of all pages.
-   `/api/public/get-pages` (GET): Retrieves all pages.
-   `/api/public/get-social-links` (GET): Retrieves social media links.
-   `/api/public/is-new-user` (POST): Checks if a user is new and creates them if they don't exist.
-   `/api/public/news-letter-subscribe` (POST): Subscribes a user to the newsletter.
-   `/api/public/subscriptions` (GET): Retrieves all active subscription plans.
-   `/api/public/user-send-message` (POST): Sends a message from a registered user.
-   `/api/public/visitor-send-message` (POST): Sends a message from a visitor.
-   `/api/public/widget-settings` (GET): Retrieves widget settings for a website.
-   `/api/public/widget-settings` (POST): Saves widget settings for a user.

### User

-   `/api/user/create/ticket/send` (POST): Sends a message in a ticket.
-   `/api/user/get_user_usage` (GET): Retrieves user usage statistics.
-   `/api/user/get-notifications` (GET): Retrieves user notifications.
-   `/api/user/get-notifications` (POST): Marks notifications as read.
-   `/api/user/get-project` (GET): Retrieves a user's project data.
-   `/api/user/get-subscription-limits` (GET): Retrieves a user's subscription limits.
-   `/api/user/increment-stats` (GET): Increments user usage statistics.
-   `/api/user/remove-conversation` (DELETE): Deletes a conversation.
-   `/api/user/save-project` (POST): Saves a user's project data.
-   `/api/user/save-project` (DELETE): Deletes a website.
-   `/api/user/tickets/open/count` (GET): Retrieves the count of open tickets for a user.
-   `/api/user/tickets/resolve` (POST): Resolves or unresolves a ticket.
-   `/api/user/tickets` (GET): Retrieves all tickets for a user.
-   `/api/user/tickets` (POST): Creates a new ticket.

### Webhook

-   `/api/webhook/stripe` (POST): Handles Stripe webhooks for subscription management.

### Websites

-   `/api/websites/get-website` (GET): Retrieves a single website by ID.
-   `/api/websites` (GET): Retrieves all websites for a user.
-   `/api/websites/toggle-ai` (POST): Toggles the AI feature for a website.

### Widget

-   `/api/widget/questions` (GET): Retrieves widget questions for a website.
-   `/api/widget/questions` (POST): Creates a new widget question.
-   `/api/widget/questions` (PUT): Updates the order of widget questions.
-   `/api/widget/questions` (DELETE): Deletes a widget question.
-   `/api/widget/settings` (GET): Retrieves widget settings for a user.
-   `/api/widget/settings` (POST): Saves widget settings for a user.
