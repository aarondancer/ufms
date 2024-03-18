# Setup and development

- [Setup and development](#setup-and-development)
  - [First-time setup](#first-time-setup)
  - [Installation](#installation)
    - [Database](#database)
    - [Configuration](#configuration)
    - [Dev server](#dev-server)
  - [Docker](#docker)
    - [Docker installation](#docker-installation)
    - [Docker-compose installation](#docker-compose-installation)
    - [Run](#run)

## First-time setup

- [Node](https://nodejs.org/en/) (at least v20 LTS)
- [Yarn](https://yarnpkg.com/lang/en/docs/install/) (at least 1.1)

## Installation

```bash
# Install dependencies from package.json
yarn install
```

### Database

[TypeORM](https://github.com/typeorm/typeorm) with the Data Mapper pattern is used.

### Configuration

Install PostgreSQL and fill in the database connection details in the `.env` file

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=app
```

Working with migrations:

```bash
# Create a new empty migration
yarn migration:create migration_name

# Truncate the database
yarn schema:drop

# Generate a migration from entity changes
yarn migration:generate migration_name
```

### Dev server

```bash
# Launch the dev server
yarn start:dev

# Launch the dev server and reload on changes
yarn watch:dev

# Launch the dev server, enable remote debugging, and reload on changes
yarn debug:dev
```

## Docker

### Docker installation

Download docker from Official website

- Mac <https://docs.docker.com/docker-for-mac/install/>
- Windows <https://docs.docker.com/docker-for-windows/install/>
- Ubuntu <https://docs.docker.com/install/linux/docker-ce/ubuntu/>

### Docker-compose installation

Download docker from [Official website](https://docs.docker.com/compose/install)

### Run

Open terminal and navigate to project directory and run the following command.

```bash
PORT=4000 docker-compose up
```
