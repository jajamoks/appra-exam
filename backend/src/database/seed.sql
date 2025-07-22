-- Password: password123 (hashed with bcrypt)
INSERT INTO users (
    name, email, password, date_of_birth, phone_number,
    post_address, home_address,
    bank_name, bsb, account_name, account_number,
    facebook_url, twitter_url, youtube_url
) VALUES (
    'John Doe',
    'john.doe@example.com',
    '$2b$10$d4rt.7v2GKkj.M7mTotxYe2bKNo7igPBuq3ILQ0k2aWGOL0aDyX/y',
    '1985-03-15',
    '+61 400 123 456',
    'PO Box 123, Sydney NSW 2000',
    '123 Main Street, Sydney NSW 2000',
    'Commonwealth Bank',
    '062-000',
    'John Doe',
    '1234567890',
    'https://facebook.com/johndoe',
    'https://twitter.com/johndoe',
    'https://youtube.com/johndoe'
);

INSERT INTO users (
    name, email, password, date_of_birth, phone_number,
    post_address, home_address,
    bank_name, bsb, account_name, account_number,
    facebook_url, twitter_url, youtube_url
) VALUES (
    'Jane Smith',
    'jane.smith@example.com',
    '$2b$10$d4rt.7v2GKkj.M7mTotxYe2bKNo7igPBuq3ILQ0k2aWGOL0aDyX/y',
    '1990-07-22',
    '+61 400 987 654',
    'PO Box 456, Melbourne VIC 3000',
    '456 Oak Avenue, Melbourne VIC 3000',
    'Westpac',
    '033-000',
    'Jane Smith',
    '9876543210',
    'https://facebook.com/janesmith',
    'https://twitter.com/janesmith',
    'https://youtube.com/janesmith'
);