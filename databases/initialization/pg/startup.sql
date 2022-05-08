CREATE USER cv_service_user WITH PASSWORD 'SuperSecretDBPassword';
CREATE DATABASE cv_database;
GRANT ALL PRIVILEGES ON DATABASE cv_database TO cv_service_user;
GRANT ALL PRIVILEGES ON DATABASE cv_database TO postgres;

CREATE USER auth_service_user WITH PASSWORD 'AuthUserPassword';
CREATE DATABASE auth_database;
GRANT ALL PRIVILEGES ON DATABASE auth_database TO auth_service_user;
GRANT ALL PRIVILEGES ON DATABASE auth_database TO postgres;