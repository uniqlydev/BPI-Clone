# Use the official PostgreSQL image from the Docker Hub
FROM postgres:latest

# Set environment variables
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=password
ENV POSTGRES_DB=app_db

# Copy the initialization script to the Docker image
COPY init.sql /docker-entrypoint-initdb.d/

# Copy the custom postgresql.conf to the Docker image
COPY postgresql.conf /etc/postgresql/postgresql.conf

# Expose the default PostgreSQL port
EXPOSE 5432

# Set the custom postgresql.conf as the configuration file
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
RUN echo "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" >> /docker-entrypoint-initdb.d/01-enable-uuid.sql
