# OdinIaFrontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.10.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Installation of 3rd party and angular modules

### Translation

npm install @ngx-translate/core --save
npm install @ngx-translate/http-loader --save

### PWA

ng add @angular/pwa --project {{project_name}}

### Material

ng add @angular/material

? Choose a prebuilt theme name, or "custom" for a custom theme: Indigo/Pink

? Set up global Angular Material typography styles? Yes

? Include the Angular animations module? Include and enable animations

### Microsoft Azure Login (MSAL)

npm install @azure/msal-browser @azure/msal-angular@latest

### DevOps - Deploy tools and information

Jenkins location:

Deploy location:

Docker logs:

https://console.cloud.google.com/kubernetes/discovery?project=latamdevelopstack-dev-w6ug&pageState=(%22savedViews%22:(%22i%22:%227cd6537f84ae466aa69dcf5aac0aa814%22,%22c%22:%5B%5D,%22n%22:%5B%5D))

### Steps to perform, from start to finish

Read the

#### ~ 0 ~

Create Collocated Design issue in the corresponding JIRA project.
Provide necessary information within the collocated design issue so that the corresponding teams can deliver.

Result of the Closed Collocated Design issue will be these deliveries:

- Bitbucket project url
- Bitbucket repository for front end url
- Bitbucket repository for back end url
- Bitbucket repository for database url

- Pipelines, up and running connected to the repositories created with their Jenkins urls, deployment urls
- Application created on Azure AD with its client_id, authority, redirect_uri

#### ~ 1 ~

Download templates for frontend, backend and database (where it applies), download the latest version

Front end

https://coderepo.appslatam.com/projects/LTMDEV/repos/template-angular-fe

Back end

https://coderepo.appslatam.com/projects/LTMDS/repos/template-spring-bl/browse
https://coderepo.appslatam.com/projects/LTMDS/repos/template-spring-dal/browse
https://coderepo.appslatam.com/projects/LTMDS/repos/template-spring-acl/browse

Database

https://coderepo.appslatam.com/projects/LTMDS/repos/liquibase-migration/browse

#### ~ 2 ~

Push code to the project's bitbucket repositories (front end, back end, database)

#### ~ 3 ~

Edit ingress file for front end (the correct url of ingress file should be received as the collocated design issue's artifact):

https://coderepo.appslatam.com/projects/LTMDEV/repos/gke-resources/browse/deploy/gke/deployment.yaml.erb?at=dev

Add following text:

      - path: /
        pathType: Prefix
        backend:
          service:
            name: <%= owner_name %>-{bitbucket_repository_name}-service
            port:
              number: 80

Replace {bitbucket_repository_name} with bitbucket repository name.

#### ~ 4 ~ (optional)

Modify file /deploy/env/dev.yaml (only if you need to add more custom values, e.g. key1)

    	steps_quality: false
    	steps_test: false
    	steps_vulnerability: false
    	key1: "value1"

You can replace or add key1 keys/values with whatever keys/values you need to have in your /assets/config.js

    	steps_quality 		: turn on or off quality assurance step in the pipeline
    	steps_test			: turn on or off running unit tests in the pipeline
    	steps_vulnerability : turn on or off vulnerability test in the pipeline

#### ~ 5 ~ (optional)

Modify file /deploy/gke/deployment.yaml.erb (only if you need new/more configuration parameters for the front end to work)

Focus on the last part of the file, don't change anything above line "config.js:-"

    	data:
    		config.js: |-
    		{
    		window.sessionStorage.setItem( 'server_url', "<%= dns_record %>" );
    		window.sessionStorage.setItem( 'azure_client_id', "<%= azure_client_id %>" );
    		window.sessionStorage.setItem( 'azure_authority', "<%= azure_authority %>" );
    		window.sessionStorage.setItem( 'azure_redirect_uri', "<%= dns_record %>" );
    		window.sessionStorage.setItem( 'key1', "<%= key1 %>" );
    		}

It is suggested to store the information in the local/sessionStorage and access it via StorageService.

Replace "key1" keys with whatever keys you have in your assets/config.json and you want to fill in with the dev.yaml or intg.yaml or prod.yaml found in deploy/env folder (depending on the environment).

#### ~ 6 ~

Push to dev branch on https://delivery.prod.appslatam.com/prueba-master/job/LTMDEV will trigger Jenkins' pipeline do the deploy

Your dev branch will be on a different URL.

### ~ 7 ~

Add following lines to the index.html, within `<header>`:

```html
<!-- This file should not exist locally -->

<script src="assets/config/config.js"></script>
```

### ~ 8 ~

To run the app on localhost, **copy** /assets/config-localhost.js to /assets/config/config.js and modify /assets/config/config.json with your values

File /assets/config/config.json _should not_ be pushed to bitbucket (use .gitignore)

### ~ 9 ~

Login into appslatam.com artifactoryrepo1

npm login

Setup NPM registry source before running npm install

npm config set registry https://artifactoryrepo1.appslatam.com/artifactory/api/npm/corp-libs-npm-release/
