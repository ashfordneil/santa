PRAGMA user_version = 1;

CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    wish_list TEXT,
    list_last_updated INTEGER
);

CREATE TABLE GiftExchangeGroup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE GroupMembership (
    user INTEGER NOT NULL,
    gift_exchange_group INTEGER NOT NULL,
    PRIMARY KEY (user, gift_exchange_group),
    FOREIGN KEY (user) REFERENCES Users(id),
    FOREIGN KEY (gift_exchange_group) REFERENCES GiftExchangeGroup(id)
);

CREATE TABLE Gift (
    receiver INTEGER NOT NULL,
    giver INTEGER NOT NULL,
    gift_exchange_group INTEGER NOT NULL,
    year INTEGER NOT NULL,
    PRIMARY KEY (receiver, giver, gift_exchange_group, year),
    FOREIGN KEY (receiver) REFERENCES Users(id),
    FOREIGN KEY (giver) REFERENCES Users(id),
    FOREIGN KEY (gift_exchange_group) REFERENCES GiftExchangeGroup(id)
);