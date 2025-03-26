-- Reset ALL data including user accounts
DELETE FROM listing;
DELETE FROM images;
DELETE FROM conversation;
DELETE FROM message;
DELETE FROM person;
DELETE FROM auth_tokens;

-- Reset the autoincrement counter for all tables
DELETE FROM sqlite_sequence WHERE name='listing';
DELETE FROM sqlite_sequence WHERE name='images';
DELETE FROM sqlite_sequence WHERE name='conversation';
DELETE FROM sqlite_sequence WHERE name='message';
DELETE FROM sqlite_sequence WHERE name='person';
DELETE FROM sqlite_sequence WHERE name='auth_tokens';

-- Vacuum the database to reclaim space
VACUUM; 