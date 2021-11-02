PRAGMA user_version = 1;

CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name STRING NOT NULL,
    email STRING,
    phone_number STRING,
    CONSTRAINT contactable CHECK (
        email NOT NULL OR
        phone_number NOT NULL
    )
);