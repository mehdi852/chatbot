import { db } from '@/configs/db.server'; // Your Drizzle DB config
import { Users, UserTickets, VisitorTicketMessages, TicketMessages, MetaData, Pages, SubscriptionsTypes, SubscritpionsFeatures, Invoices, UsersSubscriptions, ContactSettings, ContactFaqs, ContactStats } from '@/configs/schema'; // Your database schema
import { count, gte, eq, desc, or, like } from 'drizzle-orm'; // Import the count function
import { revalidatePath } from 'next/cache';

// test for  git
/**
 * Fetches the total number of users in the database
 * @returns {Promise<{totalUsers: number}>} The total number of users
 * @throws {Error} If there is an error while fetching the total users count
 */
async function getTotalUsers() {
    try {
        // Use Drizzle's count function
        const result = await db
            .select({
                totalUsers: count(), // Count all rows
            })
            .from(Users);

        // Access the count from the result
        const { totalUsers } = result[0];

        return { totalUsers };
    } catch (error) {
        console.error('Error fetching total users:', error);
        throw error;
    }
}

/**
 * Counts the number of new users in the last 24 hours
 * @returns {Promise<{newUsers: number}>} The count of new users in the last 24 hours
 * @throws {Error} If there is an error while fetching the new users count
 */
async function totalNewUsers() {
    try {
        // Use Drizzle's count function
        const result = await db
            .select({
                newUsers: count(), // Count all rows
            })
            .from(Users)
            .where(gte(Users.created_at, new Date(Date.now() - 24 * 60 * 60 * 1000)));

        // Access the count from the result
        const { newUsers } = result[0];

        return { newUsers };
    } catch (error) {
        console.error('Error fetching total new users:', error);
        throw error;
    }
}

/**
 * Fetches the latest users based on the creation date in descending order.
 * It retrieves up to 7 users.
 *
 * @returns {Promise<Users[]>} The latest users ordered by creation date.
 * @throws {Error} If there is an error while fetching the latest users.
 */
async function getLatestUsers() {
    try {
        const latestUsers = await db.select().from(Users).orderBy(Users.created_at, { ascending: false }).limit(7);

        return latestUsers;
    } catch (error) {
        console.error('Error fetching latest users:', error);
        throw error;
    }
}

/**
 * Fetches a user by their email address.
 *
 * @param {string} email - The email address of the user to retrieve.
 * @returns {Promise<object>} - The user object corresponding to the given email.
 * @throws {Error} - If there is an error while fetching the user.
 */
async function getUserByEmail(email) {
    try {
        const user = await db.select().from(Users).where(eq(Users.email, email));

        return user;
    } catch (error) {
        console.error('Error fetching user by email:', error);
        throw error;
    }
}

/**
 * Edit a user by email, only update the fields that have changed
 * @param {string} email - The email of the user to edit
 * @param {object} user - The user object
 * @param {object} changedFields - An object with the fields that have changed
 * @returns {Promise<object>} - The updated user object
 * @throws {Error} - If there is an error while updating the user
 */
async function editUserByEmail(email, user, changedFields) {
    try {
        // edit the user with only the changed fields
        // if a field in changedFields is empty it will not be updated
        for (const key in changedFields) {
            if (Object.hasOwnProperty.call(changedFields, key) && changedFields[key] !== undefined) {
                user[key] = changedFields[key];
            }
        }
        // convert user.created_at to date object
        user.created_at = new Date(user.created_at);

        //  check if user.subsciption_ends_at if not null then we need to convert it to date object
        if (user.subscription_ends_at !== null) {
            user.subscription_ends_at = new Date(user.subscription_ends_at);
        }

        const updatedUser = await db.update(Users).set(user).where(eq(Users.email, email));

        return updatedUser;
    } catch (error) {
        console.error('Error editing user by email:', error);
        throw error;
    }
}

/**
 * Fetches the users based on the page number and how many users per page.
 * It returns the users from new to old based on the date.
 * @param {number} pageNumber - The page number.
 * @param {number} usersPerPage - The number of users per page.
 * @returns {Promise<Users[]>} The users based on the page number and how many users per page.
 */
async function getUsersPerPage(pageNumber, usersPerPage) {
    try {
        const users = await db
            .select()
            .from(Users)
            .orderBy(desc(Users.created_at))
            .offset((pageNumber - 1) * usersPerPage)
            .limit(usersPerPage);

        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

/**
 * Fetches the tickets based on the page number and how many tickets per page.
 * It returns the tickets from new to old based on the date.
 * @param {number} pageNumber - The page number.
 * @param {number} ticketsPerPage - The number of tickets per page.
 * @returns {Promise<VisitorTicketMessages[]>} The tickets based on the page number and how many tickets per page.
 */
async function getTicketsPerPage(pageNumber, ticketsPerPage) {
    try {
        const tickets = await db
            .select()
            .from(VisitorTicketMessages)
            .orderBy(desc(VisitorTicketMessages.date))
            .offset((pageNumber - 1) * ticketsPerPage)
            .limit(ticketsPerPage);

        return tickets;
    } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
    }
}

/**
 * Marks a ticket as read based on the sender status.
 *
 * @param {boolean} is_visitor - Flag indicating if the ticket sent as visitor
 * @param {number} ticket_id - The ID of the ticket to mark as read
 * @returns {Promise<any>} The updated ticket object
 */
async function markTicketAsRead(is_user, ticket_id) {
    // log in some debugging
    try {
        if (is_user) {
            const ticket = await db.update(UserTickets).set({ isRead: true }).where(eq(UserTickets.ticket_id, ticket_id));
            return ticket;
        } else {
            const ticket = await db.update(VisitorTicketMessages).set({ isRead: true }).where(eq(VisitorTicketMessages.id, ticket_id));
            return ticket;
        }
    } catch (error) {
        console.error('Error fetching tickets:', error.message);
        throw error;
    }
}

/**
 * Retrieves ticket messages based on the provided ticket ID.
 *
 * @param {number} ticket_id - The ID of the ticket to retrieve messages for
 * @returns {Promise<object>} - The ticket messages corresponding to the given ticket ID
 * @throws {Error} - If there is an error while fetching the ticket messages
 */
async function getTicketMessages(ticket_id) {
    try {
        const ticket = await db.select().from(TicketMessages).where(eq(TicketMessages.ticket_id, ticket_id));
        return ticket;
    } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
    }
}

/**
 * Retrieves all user tickets along with their messages.
 *
 * @returns {Promise<object[]>} - An array of user ticket objects with their messages
 * @throws {Error} - If there is an error while fetching the tickets
 */
async function getUsersTickets() {
    try {
        const tickets = await db.select().from(UserTickets);

        for (let i = 0; i < tickets.length; i++) {
            const ticket_id = tickets[i].ticket_id;
            const messages = await getTicketMessages(ticket_id);
            tickets[i].messages = messages; // add the messages to the ticket
        }
        return tickets;
    } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
    }
}

/**
 * Adds a new ticket message to the database for admin response.
 *
 * @param {number} ticket_id - The ID of the ticket to respond to.
 * @param {string} subject - The subject of the response message.
 * @param {string} body - The body of the response message.
 * @param {number} admin_id - The ID of the admin responding to the ticket.
 */
async function adminRespondTicket(ticket_id, subject, body, admin_id) {
    try {
        // add a ticket to ticket_messages using ticket_id
        // the data is ticket_id  user_id  subject  body date

        const ticket = await db.insert(TicketMessages).values({ ticket_id: ticket_id, user_id: admin_id, subject, body, date: new Date(), isAdmin: true });
        return ticket;
    } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
    }
}

/**
 * Retrieves a ticket by the provided email address.
 * If the ticket is not found in the VisitorTicketMessages table, it tries to find the ticket in the UserTickets table by joining with the Users table based on the email.
 *
 * @param {string} email - The email address used to retrieve the ticket.
 * @returns {Promise<object>} - The ticket corresponding to the given email.
 * @throws {Error} - If there is an error while fetching the ticket.
 */
async function getTicketByEmail(email) {
    try {
        const ticket = await db.select().from(VisitorTicketMessages).where(eq(VisitorTicketMessages.email, email));

        if (!ticket[0]) {
            // get users tickets using email joining User.id to get the email from Users
            // since email doesnt exists in user_tickets use drizzle join

            const user = await db.select().from(Users).where(eq(Users.email, email));
            if (user[0]) {
                ticket[0] = await db.select().from(UserTickets).where(eq(UserTickets.user_id, user[0].id));
            }
        }
        return ticket;
    } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
    }
}

/**
 * Sets the general settings of the website.
 *
 * @param {string} siteTitle - The title of the website.
 * @param {string} siteDescription - The description of the website.
 * @param {string} siteKeywords - The keywords of the website.
 * @param {string} googleAnalyticsId - The Google Analytics ID of the website.
 * @returns {Promise<void>} - A promise that resolves when the settings are set.
 * @throws {Error} - If there is an error while setting the settings.
 */
async function setGeneralSettings(siteTitle, siteDescription, siteKeywords, googleAnalyticsId, maintenanceMode, logoUrl, siteAddress, sitePhone, siteEmail) {
    try {
        // First, check if we have any existing settings
        const existingSettings = await db.select().from(MetaData).limit(1);

        if (existingSettings.length === 0) {
            // No settings exist, create new row
            const newSettings = await db
                .insert(MetaData)
                .values({
                    siteTitle,
                    siteDescription,
                    siteKeywords,
                    googleAnalyticsId,
                    maintenanceMode,
                    logo_url: logoUrl,
                    address: siteAddress,
                    phone: sitePhone,
                    email: siteEmail,
                })
                .returning();

            return newSettings[0];
        } else {
            // Settings exist, update them
            const updatedSettings = await db
                .update(MetaData)
                .set({
                    siteTitle,
                    siteDescription,
                    siteKeywords,
                    googleAnalyticsId,
                    maintenanceMode,
                    logo_url: logoUrl,
                    address: siteAddress,
                    phone: sitePhone,
                    email: siteEmail,
                })
                .where(eq(MetaData.id, existingSettings[0].id))
                .returning();

            return updatedSettings[0];
        }
    } catch (error) {
        console.error('Error updating general settings:', error);
        throw error;
    }
}

/**
 * Retrieves the general settings of the website.
 *
 * @returns {Promise<object>} - The general settings of the website with the keys
 *   `siteTitle`, `siteDescription`, `siteKeywords`, and `googleAnalyticsId`.
 * @throws {Error} - If there is an error while fetching the settings.
 */
const getGeneralSettings = async () => {
    try {
        const settings = await db.select().from(MetaData).limit(1);
        return settings[0];
    } catch (error) {
        console.error('Error fetching general settings:', error);
        throw error;
    }
};

/**
 * Creates a new subscription type.
 *
 * @param {string} name - The name of the subscription type.
 * @param {boolean} status - The status of the subscription type.
 * @param {number} price - The price of the subscription type.
 * @returns {Promise<{ id: number, name: string, status: boolean, price: number, createdAt: Date }>} - The created subscription type.
 * @throws {Error} - If there is an error while creating the subscription type.
 */
const createSubscriptionType = async (name, status, price, yearlyPrice, stripeMonthlyLink, stripeYearlyLink, stripeMonthlyPriceId, stripeYearlyPriceId) => {
    try {
        const subscriptionType = await db.insert(SubscriptionsTypes).values({ name, status, price, yearlyPrice, stripeMonthlyLink, stripeYearlyLink, stripeMonthlyPriceId, stripeYearlyPriceId });
        const newSubscriptionType = await db.select().from(SubscriptionsTypes).where(eq(SubscriptionsTypes.name, name)).limit(1);

        return newSubscriptionType[0];
    } catch (error) {
        console.error('Error creating subscription type:', error);
        throw error;
    }
};

/**
 * Retrieves all subscription types from the database.
 *
 * @returns {Promise<SubscriptionsTypes[]>} - The subscription types.
 * @throws {Error} - If there is an error while fetching the subscription types.
 */

const getSubscriptionsTypes = async () => {
    try {
        const subscriptions = await db.select().from(SubscriptionsTypes);

        // Step 2: Fetch all features and group by subscription_id
        const features = await db.select().from(SubscritpionsFeatures);

        // Step 3: Map features to their respective subscriptions
        const subscriptionTypes = subscriptions.map((subscription) => {
            // Find and attach the features for this subscription
            const relatedFeatures = features.filter((feature) => feature.subscription_id === subscription.id);
            return {
                ...subscription,
                features: relatedFeatures,
            };
        });

        return subscriptionTypes;
    } catch (error) {
        console.error('Error fetching subscription types:', error);
        throw error;
    }
};

///  remove  a SubscriptionType by id

/**
 * Removes a subscription type from the database based on the provided ID.
 *
 * @param {number} id - The ID of the subscription type to be removed.
 * @returns {Promise} - A promise indicating the success of the removal operation.
 * @throws {Error} - If there is an error while removing the subscription type.
 */
const removeSubscriptionType = async (id) => {
    try {
        // before  remove we go to table SubscritpionsFeatures and remove all features by sub_id

        const subscriptionFeatures = await db.delete(SubscritpionsFeatures).where(eq(SubscritpionsFeatures.subscription_id, id));

        // we get the subscription
        const subscriptionTypes = await db.delete(SubscriptionsTypes).where(eq(SubscriptionsTypes.id, id));
        return subscriptionTypes;
    } catch (error) {
        console.error('Error fetching subscription types:', error);
        throw error;
    }
};

/**
 * Updates the status of a subscription type in the database based on the provided ID.
 *
 * @param {number} id - The ID of the subscription type to update.
 * @param {boolean} status - The new status to set for the subscription type.
 * @returns {Promise} - A promise that resolves to the updated subscription type.
 * @throws {Error} - If there is an error while updating the subscription type.
 */
const setStatusOfSubscriptionType = async (id, status) => {
    try {
        const subscriptionTypes = await db.update(SubscriptionsTypes).set({ status }).where(eq(SubscriptionsTypes.id, id));
        return subscriptionTypes;
    } catch (error) {
        console.error('Error fetching subscription types:', error);
        throw error;
    }
};

/**
 * Updates a subscription type in the database with new values for name and price, based on the provided ID.
 *
 * @param {number} id - The ID of the subscription type to update.
 * @param {string} name - The new name to set for the subscription type.
 * @param {number} price - The new price to set for the subscription type.
 * @returns {Promise} - A promise that resolves to the updated subscription type.
 * @throws {Error} - If there is an error while updating the subscription type.
 */
const editSubscriptionType = async (id, name, price, yearlyPrice) => {
    try {
        const subscriptionTypes = await db.update(SubscriptionsTypes).set({ name, price, yearlyPrice }).where(eq(SubscriptionsTypes.id, id));
        return subscriptionTypes;
    } catch (error) {
        console.error('Error fetching subscription types:', error);
        throw error;
    }
};

// create a function that add a Subscription features with the selected sub id, it has name,createdAt,subscription_id

const createSubscriptionFeature = async (name, subscription_id) => {
    try {
        const subscriptionFeature = await db.insert(SubscritpionsFeatures).values({ name, subscription_id });
        return subscriptionFeature;
    } catch (error) {
        console.error('Error creating subscription feature:', error);
        throw error;
    }
};

// remove a subscription feature by id
const removeSubscriptionFeature = async (id) => {
    try {
        const subscriptionFeature = await db.delete(SubscritpionsFeatures).where(eq(SubscritpionsFeatures.id, id));
        return subscriptionFeature;
    } catch (error) {
        console.error('Error removing subscription feature:', error);
        throw error;
    }
};

// edit a subscription feature by id
const editSubscriptionFeature = async (id, name) => {
    try {
        const subscriptionFeature = await db.update(SubscritpionsFeatures).set({ name }).where(eq(SubscritpionsFeatures.id, id));
        return subscriptionFeature;
    } catch (error) {
        console.error('Error editing subscription feature:', error);
        throw error;
    }
};

/// resolve a ticket by id it can be a user ticket or a visitor ticket
const resolveTicket = async (ticket_id) => {
    try {
        const ticket = await db.update(UserTickets).set({ resolved: true }).where(eq(UserTickets.ticket_id, ticket_id));
        return ticket;
    } catch (error) {
        console.error('Error resolving ticket:', error);
        throw error;
    }
};

/**
 * Fetches billing information for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object>} The user's billing information.
 */
async function getUserBillingInfo(userId) {
    try {
        const user = await db.select().from(Users).where(eq(Users.id, userId)).limit(1);

        if (!user[0]) {
            throw new Error('User not found');
        }

        const invoices = await db.select().from(Invoices).where(eq(Invoices.user_id, userId)).orderBy(desc(Invoices.date)).limit(5); // Fetch last 5 invoices

        const userSubscription = await db.select().from(UsersSubscriptions).where(eq(UsersSubscriptions.user_id, userId)).limit(1);

        let subscriptionType = null;
        if (userSubscription[0] && userSubscription[0].subscription_type_id) {
            subscriptionType = await db.select().from(SubscriptionsTypes).where(eq(SubscriptionsTypes.id, userSubscription[0].subscription_type_id)).limit(1);
            subscriptionType = subscriptionType[0] || null;
        }

        return {
            isSubscribed: user[0].subscription,
            subscriptionEndsAt: user[0].subscription_ends_at,
            paymentMethod: user[0].payment_method,
            cardLastFour: user[0].card_last_four,
            cardExpiration: user[0].card_expiration,
            invoices: invoices,
            userSubscription: userSubscription[0] || null,
            subscriptionType: subscriptionType,
        };
    } catch (error) {
        console.error('Error fetching user billing info:', error);
        throw error;
    }
}

//  function that get SubscriptionType by priceId
const getSubscriptionTypeByPriceId = async (priceId) => {
    const subscriptionType = await db
        .select()
        .from(SubscriptionsTypes)
        .where(or(eq(SubscriptionsTypes.stripeMonthlyPriceId, priceId), eq(SubscriptionsTypes.stripeYearlyPriceId, priceId)))
        .limit(1);
    return subscriptionType;
};

/**
 * Creates a user subscription and updates user details after a successful subscription.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} subscriptionTypeId - The ID of the subscription type.
 * @param {string} stripeSubscriptionId - The Stripe subscription ID.
 * @param {string} stripePriceId - The Stripe price ID.
 * @param {Date} startDate - The start date of the subscription.
 * @param {Date} endDate - The end date of the subscription.
 * @returns {Promise<object>} The created user subscription.
 * @throws {Error} If there's an error creating the subscription or updating user details.
 */
const createUserSubscription = async (userId, stripeCustomerId, subscriptionTypeId, stripeSubscriptionId, stripePriceId, startDate, endDate) => {
    try {
        // Create the user subscription
        const userSubscription = await db
            .insert(UsersSubscriptions)
            .values({
                user_id: userId,
                stripe_customer_id: stripeCustomerId,
                subscription_type_id: subscriptionTypeId,
                stripe_subscription_id: stripeSubscriptionId,
                stripe_price_id: stripePriceId,
                start_date: startDate,
                end_date: endDate,
                status: 'active',
            })
            .returning();

        // Update user details
        await db
            .update(Users)
            .set({
                subscription: true, // Set this to true when creating a new subscription
                subscription_ends_at: endDate,
            })
            .where(eq(Users.id, userId));

        return userSubscription[0];
    } catch (error) {
        console.error('Error creating user subscription:', error);
        throw error;
    }
};

/**
 * Fetches the total number of subscriptions in the database
 * @returns {Promise<{totalSubscriptions: number}>} The total number of subscriptions
 * @throws {Error} If there is an error while fetching the total subscriptions count
 */
async function getTotalSubscriptions() {
    try {
        const result = await db
            .select({
                totalSubscriptions: count(),
            })
            .from(UsersSubscriptions);

        const { totalSubscriptions } = result[0];

        return { totalSubscriptions };
    } catch (error) {
        console.error('Error fetching total subscriptions:', error);
        throw error;
    }
}

/**
 * Fetches the subscriptions based on the page number and how many subscriptions per page.
 * It returns the subscriptions from new to old based on the start date.
 * @param {number} pageNumber - The page number.
 * @param {number} subscriptionsPerPage - The number of subscriptions per page.
 * @returns {Promise<UsersSubscriptions[]>} The subscriptions based on the page number and how many subscriptions per page.
 */
async function getSubscriptionsPerPage(pageNumber, subscriptionsPerPage) {
    try {
        const subscriptions = await db
            .select({
                id: UsersSubscriptions.id,
                user_id: UsersSubscriptions.user_id,
                subscription_type_id: UsersSubscriptions.subscription_type_id,
                start_date: UsersSubscriptions.start_date,
                end_date: UsersSubscriptions.end_date,
                status: UsersSubscriptions.status,
                auto_renew: UsersSubscriptions.auto_renew,
                user: {
                    id: Users.id,
                    name: Users.name,
                    email: Users.email,
                },
                subscription_type: {
                    id: SubscriptionsTypes.id,
                    name: SubscriptionsTypes.name,
                },
            })
            .from(UsersSubscriptions)
            .innerJoin(Users, eq(UsersSubscriptions.user_id, Users.id))
            .innerJoin(SubscriptionsTypes, eq(UsersSubscriptions.subscription_type_id, SubscriptionsTypes.id))
            .orderBy(desc(UsersSubscriptions.start_date))
            .offset((pageNumber - 1) * subscriptionsPerPage)
            .limit(subscriptionsPerPage);

        return subscriptions;
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        throw error;
    }
}

/**
 * Searches for subscriptions based on user name, email, or subscription type name.
 * @param {string} searchTerm - The search term to look for in user name, email, or subscription type name.
 * @returns {Promise<UsersSubscriptions[]>} The matching subscriptions.
 * @throws {Error} If there is an error while searching for subscriptions.
 */
async function searchSubscriptions(searchTerm) {
    try {
        const subscriptions = await db
            .select({
                id: UsersSubscriptions.id,
                user_id: UsersSubscriptions.user_id,
                subscription_type_id: UsersSubscriptions.subscription_type_id,
                start_date: UsersSubscriptions.start_date,
                end_date: UsersSubscriptions.end_date,
                status: UsersSubscriptions.status,
                auto_renew: UsersSubscriptions.auto_renew,
                user: {
                    id: Users.id,
                    name: Users.name,
                    email: Users.email,
                },
                subscription_type: {
                    id: SubscriptionsTypes.id,
                    name: SubscriptionsTypes.name,
                },
            })
            .from(UsersSubscriptions)
            .innerJoin(Users, eq(UsersSubscriptions.user_id, Users.id))
            .innerJoin(SubscriptionsTypes, eq(UsersSubscriptions.subscription_type_id, SubscriptionsTypes.id))
            .where(or(like(Users.name, `%${searchTerm}%`), like(Users.email, `%${searchTerm}%`), like(SubscriptionsTypes.name, `%${searchTerm}%`)))
            .orderBy(desc(UsersSubscriptions.start_date))
            .limit(10);

        return subscriptions;
    } catch (error) {
        console.error('Error searching subscriptions:', error);
        throw error;
    }
}

const updateUserSubscriptionStatus = async (userId, status, endDate = null) => {
    try {
        // Fetch the current subscription
        const currentSubscription = await db.select().from(UsersSubscriptions).where(eq(UsersSubscriptions.user_id, userId)).limit(1);

        if (currentSubscription.length === 0) {
            throw new Error('No subscription found for this user');
        }

        // Update the user's subscription status
        await db
            .update(UsersSubscriptions)
            .set({
                status: status,
                end_date: endDate || new Date(), // If no end date is provided, use current date
                // Keep the existing subscription_type_id
                subscription_type_id: currentSubscription[0].subscription_type_id,
            })
            .where(eq(UsersSubscriptions.user_id, userId));

        // Update the user's subscription flag
        await db
            .update(Users)
            .set({
                subscription: status === 'active',
                subscription_ends_at: endDate || null,
            })
            .where(eq(Users.id, userId));
    } catch (error) {
        console.error('Error updating user subscription status:', error);
        throw error;
    }
};

/**
 * Retrieves a subscription type by its ID.
 *
 * @param {number} id - The ID of the subscription type to retrieve.
 * @returns {Promise<object|null>} The subscription type object or null if not found.
 * @throws {Error} If there's an error fetching the subscription type.
 */
const getSubscriptionTypeById = async (id) => {
    try {
        const subscriptionType = await db.select().from(SubscriptionsTypes).where(eq(SubscriptionsTypes.id, id)).limit(1);

        return subscriptionType[0] || null;
    } catch (error) {
        console.error('Error fetching subscription type by ID:', error);
        throw error;
    }
};

/**
 * Edits a user's subscription details.
 *
 * @param {string} userId - The ID of the user whose subscription is being edited.
 * @param {object} subscriptionData - The updated subscription data.
 * @returns {Promise<object>} The updated user object.
 * @throws {Error} If there's an error updating the user's subscription.
 */
const editUserSubscription = async (userId, subscriptionData) => {
    try {
        const { subscription, subscription_ends_at, stripeSubscriptionId, stripePriceId, planId } = subscriptionData;

        // Ensure subscription_ends_at is a valid Date object or null
        const formattedEndDate = subscription_ends_at ? new Date(subscription_ends_at) : null;

        // Update the user's subscription details
        const updatedUser = await db
            .update(Users)
            .set({
                subscription,
                subscription_ends_at: formattedEndDate,
                stripe_subscription_id: stripeSubscriptionId,
                stripe_price_id: stripePriceId,
                subscription_plan_id: planId,
            })
            .where(eq(Users.id, userId))
            .returning();

        // If there's an active subscription, update or create a record in UsersSubscriptions
        if (subscription && stripeSubscriptionId) {
            const existingSubscription = await db.select().from(UsersSubscriptions).where(eq(UsersSubscriptions.user_id, userId)).limit(1);

            if (existingSubscription.length > 0) {
                // Update existing subscription
                await db
                    .update(UsersSubscriptions)
                    .set({
                        subscription_type_id: planId,
                        stripe_subscription_id: stripeSubscriptionId,
                        stripe_price_id: stripePriceId,
                        end_date: formattedEndDate,
                        status: 'active',
                    })
                    .where(eq(UsersSubscriptions.user_id, userId));
            } else {
                // Create new subscription record
                await db.insert(UsersSubscriptions).values({
                    user_id: userId,
                    subscription_type_id: planId,
                    stripe_subscription_id: stripeSubscriptionId,
                    stripe_price_id: stripePriceId,
                    stripe_customer_id: updatedUser[0].stripe_customer_id || 'dummy_customer_id',
                    start_date: new Date(),
                    end_date: formattedEndDate,
                    status: 'active',
                });
            }
        } else if (!subscription) {
            // If subscription is cancelled, update the status in UsersSubscriptions
            await db
                .update(UsersSubscriptions)
                .set({
                    status: 'cancelled',
                    end_date: new Date(),
                })
                .where(eq(UsersSubscriptions.user_id, userId));
        }

        return updatedUser[0];
    } catch (error) {
        console.error('Error editing user subscription:', error);
        throw error;
    }
};

/**
 * Retrieves all tickets for a specific user along with their messages.
 *
 * @param {string} userId - The ID of the user whose tickets we want to retrieve.
 * @returns {Promise<object[]>} - An array of user ticket objects with their messages
 * @throws {Error} - If there is an error while fetching the tickets
 */
async function getUserTicketsById(userId) {
    try {
        const tickets = await db.select().from(UserTickets).where(eq(UserTickets.user_id, userId)).orderBy(desc(UserTickets.created_at));

        for (let i = 0; i < tickets.length; i++) {
            const ticket_id = tickets[i].ticket_id;
            const messages = await getTicketMessages(ticket_id);
            tickets[i].messages = messages; // add the messages to the ticket
        }
        return tickets;
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        throw error;
    }
}

/// function that verify the user request is the same user that is logged in
const verifyUserRequest = async (email, userId) => {
    const user = await getUserByEmail(email);
    return user.id === userId;
};

// create a page
const createPage = async (name, content) => {
    // Check if page exists
    const existingPage = await db.select().from(Pages).where(eq(Pages.name, name)).limit(1);

    if (existingPage.length > 0) {
        // Update existing page
        const updatedPage = await db.update(Pages).set({ content }).where(eq(Pages.name, name)).returning();
        return updatedPage[0];
    }

    // Create new page if it doesn't exist
    const newPage = await db.insert(Pages).values({ name, content }).returning();
    return newPage[0];
};

// get all pages
const getPages = async () => {
    // revalidate
    revalidatePath('/admin/settings');
    try {
        const pages = await db
            .select({
                id: Pages.id,
                name: Pages.name,
                content: Pages.content,
            })
            .from(Pages)
            .orderBy(Pages.id); // Add explicit ordering

        if (!pages || pages.length === 0) {
            console.warn('No pages found in database');
            return [];
        }

        return pages;
    } catch (error) {
        console.error('Error fetching pages:', error);
        throw error;
    }
};

// get a page by slug
const getPageBySlug = async (slug) => {
    // revalidate path
    revalidatePath('/');

    const page = await db.select().from(Pages).where(eq(Pages.name, slug)).limit(1);
    return page[0];
};

// get the number of active subscriptions
const getActiveSubscriptions = async () => {
    try {
        const activeSubscriptions = await db.select().from(UsersSubscriptions).where(eq(UsersSubscriptions.status, 'active'));

        const inactiveSubscriptions = await db
            .select()
            .from(UsersSubscriptions)
            .where(or(eq(UsersSubscriptions.status, 'inactive'), eq(UsersSubscriptions.status, 'cancelled')));

        return {
            active: activeSubscriptions.length,
            total: activeSubscriptions.length + inactiveSubscriptions.length,
        };
    } catch (error) {
        console.error('Error getting subscriptions:', error);
        throw new Error('Failed to get subscriptions');
    }
};

// get the number of tickets UserTickets and VisitorTickets using count
const getTotalTickets = async () => {
    try {
        // Get resolved and open UserTickets
        const userTickets = await db
            .select({
                resolved: count(UserTickets.resolved),
                open: count(UserTickets.resolved, (c) => c.where(eq(UserTickets.resolved, false))),
            })
            .from(UserTickets);

        // Get resolved and open VisitorTickets
        const visitorTickets = await db
            .select({
                resolved: count(VisitorTicketMessages.resolved),
                open: count(VisitorTicketMessages.resolved, (c) => c.where(eq(VisitorTicketMessages.resolved, false))),
            })
            .from(VisitorTicketMessages);

        const totalResolved = userTickets[0].resolved + visitorTickets[0].resolved;
        const totalOpen = userTickets[0].open + visitorTickets[0].open;

        return {
            resolved: totalResolved,
            open: totalOpen,
            total: totalResolved + totalOpen,
        };
    } catch (error) {
        console.error('Error getting total tickets count:', error);
        throw new Error('Failed to get total tickets count');
    }
};

//  function to create an invoice
const createInvoice = async (userId, amount, date, invoiceNumber, status) => {
    try {
        if (!userId || !amount || !date || !invoiceNumber || !status) {
            throw new Error('Missing required parameters for invoice creation');
        }

        const invoice = await db.insert(Invoices).values({
            user_id: userId,
            invoice_number: invoiceNumber,
            date: date,
            amount: amount,
            status: status,
        });

        return invoice;
    } catch (error) {
        console.error('Error creating invoice:', error);
        throw error;
    }
};

/**
 * Retrieves the contact settings from the database.
 * 
 * @returns {Promise<object>} The contact settings object
 * @throws {Error} If there is an error while fetching the settings
 */
const getContactSettings = async () => {
    try {
        const settings = await db.select().from(ContactSettings).limit(1);
        return settings[0] || {};
    } catch (error) {
        console.error('Error fetching contact settings:', error);
        throw error;
    }
};

/**
 * Sets the contact settings in the database.
 * 
 * @param {object} contactSettings - The contact settings object to update
 * @returns {Promise<object>} The updated contact settings object
 * @throws {Error} If there is an error while updating the settings
 */
const setContactSettings = async (contactSettings) => {
    try {
        // Check if settings exist
        const existingSettings = await db.select().from(ContactSettings).limit(1);
        
        // Remove any undefined values and clean the data, also remove timestamp fields
        const cleanContactSettings = Object.fromEntries(
            Object.entries(contactSettings).filter(([key, value]) => 
                value !== undefined && key !== 'created_at' && key !== 'updated_at' && key !== 'id'
            )
        );
        
        if (existingSettings.length === 0) {
            // Create new settings with proper timestamp
            const newSettings = await db
                .insert(ContactSettings)
                .values({
                    ...cleanContactSettings,
                    updated_at: new Date()
                })
                .returning();
            return newSettings[0];
        } else {
            // Update existing settings with proper timestamp
            const updatedSettings = await db
                .update(ContactSettings)
                .set({
                    ...cleanContactSettings,
                    updated_at: new Date()
                })
                .where(eq(ContactSettings.id, existingSettings[0].id))
                .returning();
            return updatedSettings[0];
        }
    } catch (error) {
        console.error('Error setting contact settings:', error);
        throw error;
    }
};

/**
 * Retrieves all contact FAQs from the database.
 * 
 * @returns {Promise<Array>} Array of FAQ objects
 * @throws {Error} If there is an error while fetching the FAQs
 */
const getContactFaqs = async () => {
    try {
        const faqs = await db
            .select()
            .from(ContactFaqs)
            .where(eq(ContactFaqs.is_active, true))
            .orderBy(ContactFaqs.order_index);
        return faqs;
    } catch (error) {
        console.error('Error fetching contact FAQs:', error);
        throw error;
    }
};

/**
 * Sets the contact FAQs in the database.
 * 
 * @param {Array} contactFaqs - Array of FAQ objects to update
 * @returns {Promise<Array>} Array of updated FAQ objects
 * @throws {Error} If there is an error while updating the FAQs
 */
const setContactFaqs = async (contactFaqs) => {
    try {
        // For simplicity, we'll clear existing FAQs and insert new ones
        // In production, you might want a more sophisticated approach
        await db.delete(ContactFaqs);
        
        if (contactFaqs && contactFaqs.length > 0) {
            const insertedFaqs = await db
                .insert(ContactFaqs)
                .values(contactFaqs.map((faq, index) => ({
                    question: faq.question,
                    answer: faq.answer,
                    order_index: faq.order_index || index,
                    is_active: faq.is_active !== undefined ? faq.is_active : true,
                    updated_at: new Date(),
                })))
                .returning();
            return insertedFaqs;
        }
        return [];
    } catch (error) {
        console.error('Error setting contact FAQs:', error);
        throw error;
    }
};

/**
 * Retrieves all contact stats from the database.
 * 
 * @returns {Promise<Array>} Array of stat objects
 * @throws {Error} If there is an error while fetching the stats
 */
const getContactStats = async () => {
    try {
        const stats = await db
            .select()
            .from(ContactStats)
            .where(eq(ContactStats.is_active, true))
            .orderBy(ContactStats.order_index);
        return stats;
    } catch (error) {
        console.error('Error fetching contact stats:', error);
        throw error;
    }
};

/**
 * Sets the contact stats in the database.
 * 
 * @param {Array} contactStats - Array of stat objects to update
 * @returns {Promise<Array>} Array of updated stat objects
 * @throws {Error} If there is an error while updating the stats
 */
const setContactStats = async (contactStats) => {
    try {
        // For simplicity, we'll clear existing stats and insert new ones
        await db.delete(ContactStats);
        
        if (contactStats && contactStats.length > 0) {
            const insertedStats = await db
                .insert(ContactStats)
                .values(contactStats.map((stat, index) => ({
                    number: stat.number,
                    label: stat.label,
                    icon: stat.icon || '⚡',
                    order_index: stat.order_index || index,
                    is_active: stat.is_active !== undefined ? stat.is_active : true,
                    updated_at: new Date(),
                })))
                .returning();
            return insertedStats;
        }
        return [];
    } catch (error) {
        console.error('Error setting contact stats:', error);
        throw error;
    }
};


export {
    getTotalUsers, // Fetches the total number of users in the database
    removeSubscriptionType, // Removes a subscription type and its associated features
    getSubscriptionsTypes, // Retrieves all subscription types with their features
    setGeneralSettings, // Sets the general website settings
    createSubscriptionType, // Creates a new subscription type
    getGeneralSettings, // Retrieves the general website settings
    adminRespondTicket, // Adds an admin response to a ticket
    getTicketByEmail, // Retrieves a ticket by user email
    getUserByEmail, // Fetches a user by their email address
    totalNewUsers, // Counts new users in the last 24 hours
    getLatestUsers, // Retrieves the latest 7 users
    editUserByEmail, // Edits a user's information by email
    getUsersPerPage, // Fetches users with pagination
    getTicketsPerPage, // Fetches tickets with pagination
    markTicketAsRead, // Marks a ticket as read
    getTicketMessages, // Retrieves messages for a specific ticket
    getUsersTickets, // Fetches all user tickets with their messages
    setStatusOfSubscriptionType, // Updates the status of a subscription type
    editSubscriptionType, // Edits a subscription type's details
    createSubscriptionFeature, // Adds a new feature to a subscription type
    removeSubscriptionFeature, // Removes a feature from a subscription type
    editSubscriptionFeature, // Edits a subscription feature
    resolveTicket, // Marks a ticket as resolved
    getUserBillingInfo, // Retrieves a user's billing information
    getSubscriptionTypeByPriceId, // Finds a subscription type by Stripe price ID
    createUserSubscription, // Creates a new user subscription
    getTotalSubscriptions, // Counts the total number of subscriptions
    getActiveSubscriptions, // Counts the total number of active subscriptions
    getSubscriptionsPerPage, // Fetches subscriptions with pagination
    searchSubscriptions, // Searches for subscriptions based on user or subscription type
    updateUserSubscriptionStatus, // Updates a user's subscription status
    getSubscriptionTypeById, // Retrieves a subscription type by its ID
    editUserSubscription, // Edits a user's subscription details
    getUserTicketsById, // Retrieves all tickets for a specific user
    verifyUserRequest, // Verifies if the user request is the same user that is logged in
    createPage, // Creates a new page
    getPages, // Retrieves all pages
    getPageBySlug, // Retrieves a page by its slug
    getTotalTickets, // Retrieves the total number of tickets
    createInvoice, // Creates a new invoice
    getContactSettings, // Retrieves the contact settings from the database
    setContactSettings, // Sets the contact settings in the database
    getContactFaqs, // Retrieves all contact FAQs from the database
    setContactFaqs, // Sets the contact FAQs in the database
    getContactStats, // Retrieves all contact stats from the database
    setContactStats, // Sets the contact stats in the database
};
