export const checkSubscriptionFeature = (subscriptionLimits, feature, currentCount) => {
    console.log('Checking subscription feature:', { feature, currentCount, subscriptionLimits });

    if (!subscriptionLimits) {
       // console.log('No subscription limits found');
        return {
            allowed: false,
            message: "Unable to verify subscription limits"
        };
    }

    let result;
    switch (feature) {
        case 'websites':
            result = {
                allowed: currentCount < subscriptionLimits.max_websites,
                message: `Maximum websites allowed: ${subscriptionLimits.max_websites}`
            };
            return result;

        case 'paths':
            result = {
                allowed: currentCount < subscriptionLimits.max_paths_per_website,
                message: `Maximum paths per website allowed: ${subscriptionLimits.max_paths_per_website}`
            };
           // console.log('Paths check:', { currentCount, max: subscriptionLimits.max_paths_per_website, allowed: result.allowed });
            return result;

        case 'popups':
            result = {
                allowed: currentCount < subscriptionLimits.max_popups_per_path,
                message: `Maximum popups per path allowed: ${subscriptionLimits.max_popups_per_path}`
            };
          //  console.log('Popups check:', { currentCount, max: subscriptionLimits.max_popups_per_path, allowed: result.allowed });
            return result;

        case 'advertising':
            result = {
                allowed: subscriptionLimits.allow_advertising,
                message: "Advertising popups not available in your current plan"
            };
        //    console.log('Advertising check:', { allowed: subscriptionLimits.allow_advertising });
            return result;

        case 'email_collector':
            result = {
                allowed: subscriptionLimits.allow_email_collector,
                message: "Email collector not available in your current plan"
            };
        //    console.log('Email collector check:', { allowed: subscriptionLimits.allow_email_collector });
            return result;

        default:
        //    console.log('Unknown feature requested:', feature);
            return {
                allowed: false,
                message: "Unknown feature"
            };
    }
}; 