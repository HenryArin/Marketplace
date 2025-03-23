-- SQLITE3 file for CMPS 3390 Project 2
-- Spring 2025
-- AUTH: Luhar, Priyanshu pluhar@csub.edu
-- DATE: Mar 04, 2025

-- TABLES

CREATE TABLE IF NOT EXISTS person (
    userID integer primary key autoincrement,
    email text not null,
    hash text not null,
    satisfactionRate integer default 0,
    openTime datetime default CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listing (
    listingID integer primary key autoincrement,
    listerID integer not null,
    sold integer not null default 0,
    title text,
    listedTime datetime default CURRENT_TIMESTAMP,
    endTime datetime default NULL,
    description blob default null CHECK (length(description) <= 2048),
    foreign key (listerID) references person(userID) on update cascade on delete set null
);

CREATE TABLE IF NOT EXISTS images (
    imgID integer primary key autoincrement,
    listingID integer not null,
    fullpath text not null,
    foreign key (listingID) references listing(listingID) on update cascade on delete set null
);

CREATE TABLE IF NOT EXISTS place (
    placeID integer primary key autoincrement,
    name text not null,
    isVirtual integer not null,
    ownerID integer default null,
    description blob default null CHECK (length(description) <= 2048),
    foreign key (ownerID) references person(userID) on update cascade on delete set null
);

CREATE TABLE IF NOT EXISTS location (
    locationID integer primary key autoincrement,
    placeID integer default null,
    managerID integer default null,
    name text not null,
    streetAddr text not null,
    city text not null,
    state text not null,
    zip text not null,
    lat float default null,
    lng float default null,
    foreign key (placeID) references place(placeID) on update cascade on delete set null,
    foreign key (managerID) references person(userID) on update cascade on delete set null
);

CREATE TABLE IF NOT EXISTS address (
    addressID integer primary key autoincrement,
    userID integer not null,
    streetAddr text not null,
    city text not null,
    state text not null,
    zip text not null,
    foreign key (userID) references person(userID) on update cascade on delete set null
);

CREATE TABLE IF NOT EXISTS conversation (
    conversationID integer primary key autoincrement,
    senderID integer not null,
    receiverID integer not null,
    startTime datetime default CURRENT_TIMESTAMP,
    foreign key (senderID) references person(userID) on update cascade on delete set null,
    foreign key (receiverID) references person(userID) on update cascade on delete set null
);

CREATE TABLE IF NOT EXISTS message (
    messageID integer primary key autoincrement,
    conversationID integer not null,
    setting integer default 0,
    sendTime datetime default CURRENT_TIMESTAMP,
    description blob default null CHECK (length(description) <= 4096),
    foreign key (conversationID) references conversation(conversationID) on update cascade on delete set null
);

CREATE TABLE IF NOT EXISTS agreement (
    transactionID integer primary key autoincrement,
    sellerID integer not null,
    buyerID integer not null,
    listingID integer not null,
    transactionTime datetime default CURRENT_TIMESTAMP,
    foreign key (sellerID) references person(userID) on update cascade on delete set null,
    foreign key (buyerID) references person(userID) on update cascade on delete set null,
    foreign key (listingID) references listing(listingID) on update cascade on delete set null
);

-- FLAGS
PRAGMA foreign_keys = ON;
