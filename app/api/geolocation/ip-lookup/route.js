import { NextRequest, NextResponse } from 'next/server';

// IP Geolocation API endpoint using ipinfo.io
export async function POST(req) {
    try {
        const { ip } = await req.json();
        
        if (!ip) {
            return NextResponse.json(
                { error: 'IP address is required' },
                { status: 400 }
            );
        }

        // Get IP info from IPinfo Lite API - Free and unlimited access to country-level data
        const ipInfoToken = process.env.IPINFO_TOKEN || 'ecdd48ecb252de';
        const apiUrl = `https://api.ipinfo.io/lite/${ip}?token=${ipInfoToken}`;
        
        console.log('Fetching IP info from IPinfo Lite:', apiUrl.replace(ipInfoToken, '[TOKEN]'));
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'ChatbotApp/1.0',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('IPInfo Lite API error:', response.status, errorText);
            throw new Error(`IPInfo Lite API error: ${response.status} - ${errorText}`);
        }

        const ipData = await response.json();
        console.log('Raw IPInfo Lite response:', ipData);
        
        // Transform the response to match our database schema
        // IPInfo Lite response format:
        // {
        //   "ip": "8.8.8.8",
        //   "asn": "AS15169",
        //   "as_name": "Google LLC",
        //   "as_domain": "google.com",
        //   "country_code": "US",
        //   "country": "United States",
        //   "continent_code": "NA",
        //   "continent": "North America"
        // }
        
        const geoData = {
            ip: ipData.ip || ip,
            asn: ipData.asn || '', // Direct ASN field from Lite API
            as_name: ipData.as_name || '', // Direct AS name field from Lite API
            as_domain: ipData.as_domain || '', // Direct AS domain field from Lite API
            country_code: ipData.country_code || '',
            country: ipData.country || '', // Direct country name from Lite API
            continent_code: ipData.continent_code || '',
            continent: ipData.continent || '', // Direct continent name from Lite API
        };
        
        console.log('Transformed geo data:', geoData);

        return NextResponse.json({
            success: true,
            data: geoData
        });

    } catch (error) {
        console.error('IP geolocation lookup error:', error);
        
        // Return default data if API fails
        return NextResponse.json({
            success: false,
            error: error.message,
            data: {
                ip: '',
                asn: '',
                as_name: '',
                as_domain: '',
                country_code: '',
                country: '',
                continent_code: '',
                continent: '',
            }
        });
    }
}
