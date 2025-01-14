// Import Stripe and use the environment variable to get the secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Access the Stripe Secret Key from environment variables

// Helper function to fetch the price ID based on the user's geolocation
const fetchPriceIdForGeolocation = async (country) => {
    const priceMap = {
        'United States': 'price_1QgxXLKKKfcSVt0cWqYjbYlW', // USD Price ID
        'Australia': 'price_1Qf8HwKKKfcSVt0cCH2rcpwZ', // AUD Price ID
        'United Kingdom': 'price_1QgxWeKKKfcSVt0cqIoeHeMs', // GBP Price ID
        'Germany': 'price_1QgxXfKKKfcSVt0cglzuQkmK', // EUR Price ID
        'New Zealand': 'price_1QgxXzKKKfcSVt0cOalzcUVj', // NZD Price ID
    };

    // Return the appropriate price ID based on the user's country
    return priceMap[country] || priceMap['United States'];  // Default to USD if country is not found
}

// Function to get the country from the IP address (using IP Geolocation)
async function getCountryFromIP(ipAddress) {
    const response = await fetch(`http://ip-api.com/json/${ipAddress}`);
    const data = await response.json();
    return data.country;  // Returns the country name (e.g., 'United States')
}

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { email, ipAddress } = req.body;  // Ensure you're getting the email and IP from the frontend

        try {
            // Fetch the correct price ID based on the user's country
            const country = await getCountryFromIP(ipAddress);  // Fetch the country based on IP
            const priceId = await fetchPriceIdForGeolocation(country);  // Get Price ID based on country

            // Create the subscription with a 14-day free trial
            const subscription = await stripe.subscriptions.create({
                customer_email: email,  // The email of the customer
                items: [{
                    price: priceId,  // Use the correct price ID based on geolocation
                }],
                trial_period_days: 14,  // Set the free trial period
            });

            res.status(200).json({ subscription });  // Send back the subscription data
        } catch (error) {
            res.status(500).json({ error: error.message });  // Return an error message if something goes wrong
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
