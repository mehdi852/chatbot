-- Migration: Create widget_settings table
-- This script creates the widget_settings table for storing user widget customizations

CREATE TABLE IF NOT EXISTS widget_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    primary_color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
    header_color VARCHAR(7) NOT NULL DEFAULT '#1e40af',
    background_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
    text_color VARCHAR(7) NOT NULL DEFAULT '#374151',
    button_size VARCHAR(20) NOT NULL DEFAULT 'medium',
    button_position VARCHAR(20) NOT NULL DEFAULT 'bottom-right',
    border_radius VARCHAR(20) NOT NULL DEFAULT 'rounded',
    welcome_message TEXT NOT NULL DEFAULT 'Hi! How can we help you today?',
    placeholder_text VARCHAR(255) NOT NULL DEFAULT 'Type your message...',
    company_name VARCHAR(255) NOT NULL DEFAULT 'Support Team',
    button_text VARCHAR(255) NOT NULL DEFAULT 'Chat with us',
    show_branding BOOLEAN NOT NULL DEFAULT true,
    brand_name VARCHAR(255) NOT NULL DEFAULT 'BirdSeed',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create unique constraint on user_id (each user can have only one widget settings record)
CREATE UNIQUE INDEX IF NOT EXISTS widget_settings_user_id_unique ON widget_settings (user_id);

-- Add some example comments for field descriptions
COMMENT ON TABLE widget_settings IS 'Stores customization settings for chat widgets per user';
COMMENT ON COLUMN widget_settings.primary_color IS 'Primary color for widget buttons and accents (hex color)';
COMMENT ON COLUMN widget_settings.header_color IS 'Header background color (hex color)';
COMMENT ON COLUMN widget_settings.background_color IS 'Widget background color (hex color)';
COMMENT ON COLUMN widget_settings.text_color IS 'Text color for messages (hex color)';
COMMENT ON COLUMN widget_settings.button_size IS 'Size of the chat launcher button: small, medium, large';
COMMENT ON COLUMN widget_settings.button_position IS 'Position of chat button: bottom-right, bottom-left, bottom-center';
COMMENT ON COLUMN widget_settings.border_radius IS 'Border radius style: none, small, rounded, full';
COMMENT ON COLUMN widget_settings.welcome_message IS 'Welcome message displayed when widget opens';
COMMENT ON COLUMN widget_settings.placeholder_text IS 'Placeholder text for message input';
COMMENT ON COLUMN widget_settings.company_name IS 'Company/team name displayed in widget header';
COMMENT ON COLUMN widget_settings.button_text IS 'Text displayed in chat launcher tooltip';
COMMENT ON COLUMN widget_settings.show_branding IS 'Whether to show "Powered by [brand]" text';
COMMENT ON COLUMN widget_settings.brand_name IS 'Brand name shown in footer when branding is enabled';
